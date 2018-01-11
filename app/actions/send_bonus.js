const { formatBonus } = require('../attachments');
const { formatBonusDialog } = require('../dialogs');
const { shuffle } = require('../common');

module.exports = async (payload, action, deps) => {
  console.log('sending bonus');
  const {
    user: { id: user_id },
    team: { id: team_id },
    message_ts,
    channel: { id: channel_id },
    original_message,
    trigger_id
  } = payload;

  const { throwdown_id, round } = JSON.parse(action.value);

  const { slack, dbInterface, commandFactory, exec, user } = deps;

  //find existing user data responses
  //filter out already asked questions
  const getParticipants = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('findOne')
    .setMatch({ _id: throwdown_id })
    .setUpdate({ participants: 1 })
    .save();

  const getUserData = commandFactory('db')
    .setEntity('UserData')
    .setMatch({ team_id })
    .setOperation('find')
    .setPopulate('question')
    .save();

  const getResponses = commandFactory('db')
    .setEntity('Response')
    .setOperation('find')
    .setMatch({ user: user._id })
    .setPopulate('question')
    .save();

  const getBonusQuestions = commandFactory('db')
    .setEntity('Question')
    .setOperation('find')
    .setMatch({ bonus: true })
    .save();

  const [
    userData,
    { participants },
    responses,
    bonusQuestions
  ] = await exec
    .many([
      [dbInterface, getUserData],
      [dbInterface, getParticipants],
      [dbInterface, getResponses],
      [dbInterface, getBonusQuestions]
    ])
    .catch(err => console.log(err));

  const isUser = f => f.user_id == user_id;
  const notUser = f => f.user_id != user_id;
  const matchUser = id => f => f.user == id.toString();

  //bqtr = bonus question this round
  const bqtr = responses.find(r => {
    return (
      r.throwdown.toString() == throwdown_id.toString() &&
      r.round == round &&
      r.bonus
    );
  });

  //if bonus response exists for this round and it has been responded to
  if (bqtr && bqtr.responded && bqtr.coworker_id) {
    console.log('response exists and has been responded to');
    const sendAlreadyAnswered = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setUser(user_id)
      .setChannel(channel_id)
      .setText(`You've already answered this question.`)
      .save();

    return await exec.one(slack, sendAlreadyAnswered);
  }

  if (bqtr && bqtr.responded && !bqtr.coworker_id) {
    console.log('personal question has been responded to already');
    const sendRespondAgain = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setUser(user_id)
      .setChannel(channel_id)
      .setText(
        `It look's like you've already answered this. Feel free to change your answer if you want! (it wont get you any more points...)`
      )
      .setAttachments(formatBonus(bqtr))
      .save();

    return await exec.one(slack, sendRespondAgain);
  }
  if (bqtr && !bqtr.responded && bqtr.coworker_id) {
    console.log('coworker response exists but not yet responded');
    let coworkerResponse = userData.find(
      u =>
        u.question._id.toString() == bqtr.question._id.toString() &&
        u.user_id == (bqtr.coworker_id || 'dne')
    ).response;
    const toFormat = Object.assign(bqtr, { response: coworkerResponse });
    let formattedBonus = formatBonus(toFormat);

    const resendCoworkerQuestion = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setUser(user_id)
      .setChannel(channel_id)
      .setText('')
      .setAttachments(formattedBonus)
      .save();

    return await exec.one(slack, resendCoworkerQuestion);
  }
  //if bonus response exists for this round and it has NOT been responded to
  if (bqtr && !bqtr.responded && !bqtr.coworker_id) {
    const resendQuestion = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setUser(user_id)
      .setChannel(channel_id)
      .setText('')
      .setAttachments(formatBonus(bqtr))
      .save();

    return await exec.one(slack, resendQuestion);
  }

  const getQuestionToAsk = () => {
    const askedBonusQuestionIds = userData
      .filter(isUser)
      .map(d => d.question._id.toString());

    const askedCoworkerQuestionIds = responses
      .filter(r => r.bonus)
      .map(r => r.question._id.toString());

    const unaskedCoworkerQuestions = userData.filter(notUser).filter(r => {
      return !askedCoworkerQuestionIds.includes(r.question._id.toString());
    });

    const unaskedPersonalQuestions = bonusQuestions.filter(
      b => !askedBonusQuestionIds.includes(b._id.toString())
    );

    if (round % 2 == 0 && unaskedCoworkerQuestions.length > 0) {
      let u = shuffle(unaskedCoworkerQuestions)[0];
      return {
        question: u.question,
        coworker_id: u.user_id,
        response: u.response
      };
    } else {
      return {
        question: shuffle(unaskedPersonalQuestions)[0]
      };
    }
  };

  const toAsk = getQuestionToAsk();

  //if no bonus response exists for this round, then create shell response
  if (!bqtr) {
    console.log('response does not exist, creating initial response');
    const matchData = {
      question: toAsk.question._id,
      user: user._id
    };

    const updateData = {
      round,
      throwdown: throwdown_id,
      responded: false,
      coworker_id: toAsk.coworker_id ? toAsk.coworker_id : null,
      bonus: true
    };

    const buildInitialResponse = commandFactory('db')
      .setEntity('Response')
      .setOperation('findOneAndUpdate')
      .setMatch(matchData)
      .setUpdate(Object.assign({}, matchData, updateData))
      .setOptions({ new: true, upsert: true })
      .save();

    let resp = await exec.one(dbInterface, buildInitialResponse);
  }

  //now send the question
  const input = Object.assign({}, toAsk, { throwdown: throwdown_id, round });
  const formattedBonusQuestion = formatBonus(input);
  const sendQuestion = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setUser(user_id)
    .setChannel(channel_id)
    .setAttachments(formattedBonusQuestion)
    .save();

  return await exec.one(slack, sendQuestion);
};
