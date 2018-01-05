const {
  singleQuestion,
  formatBonusQuestion,
  formatCoworkerQuestion
} = require('../attachments');
const { findFullThrowdown, shuffle } = require('../common');
const sendBonus = require('./send_bonus');

module.exports = async (payload, action, deps) => {
  const {
    user: { id: user_id },
    team: { id: team_id },
    message_ts,
    channel: { id: channel_id },
    original_message
  } = payload;

  const { bonus, round, question, throwdown_id } = JSON.parse(action.value);

  const { slack, dbInterface, commandFactory, exec, user } = deps;

  //get responses for this question
  const getResponses = commandFactory('db')
    .setEntity('Response')
    .setOperation('find')
    .setMatch({ user: user._id })
    .save();

  const getUserData = commandFactory('db')
    .setEntity('UserData')
    .setOperation('findOne')
    .setMatch({ throwdown: throwdown_id, round, user: user._id })
    .save();

  const [allResponses, thisUserData] = await exec.many([
    [dbInterface, getResponses],
    [dbInterface, getUserData]
  ]);

  console.log(thisUserData);

  const thisRoundResponses = allResponses.filter(
    r => r.round == round && r.throwdown == throwdown_id
  );
  //if bonus clicked, and bonus response DOES exist for this throwdown and round
  if (bonus && (thisRoundResponses.find(r => r.bonus) || thisUserData)) {
    const alreadyAnsweredBonus = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setUser(user_id)
      .setChannel(channel_id)
      .setText(`You've already answered a bonus question for this round!`)
      .save();

    return await exec.one(slack, alreadyAnsweredBonus);
  }

  //if bonus clicked, and bonus response DOES NOT exist for this throwdown and round
  //TODO: if response IS found, then send them back the same question, formatted.
  if (bonus && !thisRoundResponses.find(r => r.bonus)) {
    let allRespondedBonusQuestionIds = allResponses
      .filter(r => r.bonus)
      .map(r => r.question);

    let getBonusQuestions = commandFactory('db')
      .setOperation('find')
      .setEntity('Question')
      .setMatch({ bonus: true, _id: { $nin: allRespondedBonusQuestionIds } })
      .save();

    let unansweredBonusQuestions = await exec.one(
      dbInterface,
      getBonusQuestions
    );

    let bonusToAsk = shuffle(unansweredBonusQuestions)[0];

    let formattedBonusQuestion = false;

    if (round % 2 == 0) {
      const getParticipants = commandFactory('db')
        .setEntity('Throwdown')
        .setOperation('findOne')
        .setMatch({ _id: throwdown_id })
        .setUpdate({ participants: 1 })
        .save();

      const { participants } = await exec.one(dbInterface, getParticipants);
      console.log(participants);
      console.log(user._id);
      const getParticipantData = commandFactory('db')
        .setEntity('UserData')
        .setOperation('find')
        .setMatch({ user: { $in: participants } })
        .setPopulate('question')
        .save();

      const allParticipantData = await exec.one(
        dbInterface,
        getParticipantData
      );

      let unaskedCoworkerData = allParticipantData.filter(d => {
        return d.user.toString() != user._id.toString();
      });
      console.log('unasked coworker data');
      console.log(unaskedCoworkerData);
      let coworkerQuestionToAsk = shuffle(unaskedCoworkerData)[0];
      //TODO: change formatcoworkerQuestion function to support just taking a question
      if (coworkerQuestionToAsk) {
        formattedBonusQuestion = formatCoworkerQuestion({
          throwdown_id,
          round,
          data: coworkerQuestionToAsk
        });
      }
    }

    //if there is a bonus to ask, and it is an odd round, send a bonus
    if (bonusToAsk && (round % 2 != 0 || !formattedBonusQuestion)) {
      //TODO: change formatBonusQuestion to support other answerTypes
      formattedBonusQuestion = formatBonusQuestion({
        throwdown_id,
        round,
        question: bonusToAsk
      });

      //save partial response so they can't get multiple bonus questions.
      const savePartialUserData = commandFactory('db')
        .setEntity('UserData')
        .setOperation('update')
        .setMatch({
          throwdown: throwdown_id,
          round
        })
        .setUpdate({
          question: bonusToAsk._id,
          shortName: bonusToAsk.shortName,
          user_id,
          team_id,
          user: user._id
        })
        .setOptions({ upsert: true, new: true })
        .save();

      let partialResponse = await exec.one(dbInterface, savePartialUserData);
      console.log('saving partial data');
      console.log(partialResponse);
    }

    if (formattedBonusQuestion) {
      const sendBonusQuestion = commandFactory('slack')
        .setOperation('ephemeralMessage')
        .setUser(user_id)
        .setChannel(channel_id)
        .setText('')
        .setAttachments(formattedBonusQuestion)
        .save();

      return await exec.one(slack, sendBonusQuestion);
    } else {
      const noBonusAvailable = commandFactory('slack')
        .setOperation('ephemeralMessage')
        .setUser(user_id)
        .setChannel(channel_id)
        .setText('There are no bonus questions at this time')
        .save();

      return await exec.one(slack, sendBonusQuestion);
    }
  }

  //existing response is a response from this round, this throwdown, and not a bonus
  let existingResponse = allResponses.find(r => {
    return (
      r.round == round &&
      r.throwdown == throwdown_id &&
      !r.bonus &&
      r.question == question._id
    );
  });

  let hasResponse = existingResponse ? true : false;

  const newQuestion = singleQuestion({
    throwdown_id,
    round,
    question,
    channel: channel_id
  });

  const sendQuestion = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setUser(user_id)
    .setChannel(channel_id)
    .setAttachments(hasResponse ? [] : newQuestion)
    .setText(hasResponse ? `You've already answered this!` : '')
    .save();

  exec.one(slack, sendQuestion);
};
