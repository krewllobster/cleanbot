const {
  formatBonusQuestion,
  formatCoworkerQuestion
} = require('../attachments');
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

  const askedBonusQuestionIds = userData
    .filter(isUser)
    .map(d => d.question._id.toString());

  const askedCoworkerQuestionIds = responses
    .filter(r => r.bonus)
    .map(r => r.question.toString());

  const unaskedCoworkerQuestions = userData.filter(notUser).filter(r => {
    return !askedCoworkerQuestionIds.includes(r.question._id.toString());
  });

  const unaskedPersonalQuestions = bonusQuestions.filter(
    b => !askedBonusQuestionIds.includes(b._id.toString())
  );

  const bonusQuestionThisRound = responses.find(r => {
    return r.throwdown.toString() == throwdown_id && r.round == round;
  });

  if (bonusQuestionThisRound) {
    let formattedQuestion;
    console.log('response exists');
    if (!bonusQuestionThisRound.correct && bonusQuestionThisRound.coworker_id) {
      //TODO: find bonus coworker question and re-send formatted
      let bonusToAsk = userData.find(u => {
        return (
          u.user_id == bonusQuestionThisRound.coworker_id &&
          u.question.toString() == bonusQuestionThisRound.question.toString()
        );
      });
      let questionType = bonusToAsk.question.questionType;
      formattedQuestion = formatCoworkerQuestion[questionType](
        bonusToAsk,
        round
      );
    }

    if (
      !bonusQuestionThisRound.correct ||
      bonusQuestionThisRound.correct == null
    ) {
      //TODO: find bonus personal question and re-send formatted
      let userDataToAsk = bonusQuestions.find(
        u => u._id.toString() == bonusQuestionThisRound.question.toString()
      );
      console.log(userDataToAsk);
      formattedQuestion = formatBonusQuestion({
        throwdown_id,
        question: userDataToAsk,
        round
      });
    }

    const resendBonus = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setText(`Bonus Question for round ${round}`)
      .setAttachments(formattedQuestion)
      .setUser(user_id)
      .setChannel(channel_id)
      .save();

    return await exec.one(slack, resendBonus);
  }

  const saveResponse = async (id, coWorkerId) => {
    let createResponse = commandFactory('db')
      .setEntity('Response')
      .setOperation('update')
      .setMatch({ throwdown: throwdown_id, round, user: user._id })
      .setUpdate({ question: id, coworker_id: coWorkerId ? coWorkerId : null })
      .setOptions({ upsert: true, new: true })
      .save();

    return await exec.one(dbInterface, createResponse);
  };

  if (round % 2 === 0 && unaskedCoworkerQuestions.length > 0) {
    let coWorkerData = shuffle(userData.filter(notUser))[0];
    let qType = coWorkerData.question.questionType;
    const formattedQuestion = formatCoworkerQuestion[qType](
      coWorkerData,
      round
    );
    let res = await saveResponse(coWorkerData._id, coWorkerData.user_id);

    const sendCoworkerQuestion = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setText(`Bonus question for round ${round}`)
      .setUser(user_id)
      .setChannel(channel_id)
      .setAttachments(formattedQuestion)
      .save();

    return await exec.one(slack, sendCoworkerQuestion);
  }

  if (unaskedPersonalQuestions.length > 0) {
    let bonusQuestion = shuffle(unaskedPersonalQuestions)[0];
    let bonusAttachment = formatBonusQuestion({
      throwdown_id,
      question: bonusQuestion,
      round
    });

    let res = await saveResponse(bonusQuestion._id);

    const sendPersonalBonusQuestion = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setUser(user_id)
      .setChannel(channel_id)
      .setText('')
      .setAttachments(bonusAttachment)
      .save();

    return await exec.one(slack, sendPersonalBonusQuestion);
  }
  // const b = shuffle(notAsked)[0];
  // const bonusType = b.answerType;

  // if (bonusType == 'mc') {
  //   console.log('sending multiple choice bonus');
  //   let bonusAttachment = formatBonusQuestion(b, {
  //     user,
  //     throwdown: throwdown_id,
  //     round
  //   });
  //   const bonusMessage = commandFactory('slack')
  //     .setOperation('ephemeralMessage')
  //     .setUser(user_id)
  //     .setChannel(channel_id)
  //     .setText('')
  //     .setAttachments(bonusAttachment)
  //     .save();

  //   return await exec.one(slack, bonusMessage);
  // }

  // if (bonusType == 'long') {
  //   console.log('sending longForm bonus');
  //   let bonusDialog = formatBonusDialog(b, {
  //     user,
  //     throwdown: throwdown_id,
  //     round
  //   });
  //   let sendBonusDialog = commandFactory('slack')
  //     .setOperation('openDialog')
  //     .setTrigger(trigger_id)
  //     .setDialog(bonusDialog)
  //     .save();

  //   return await exec.one(slack, sendBonusDialog);
  // }
};

//already ask check done in send_question.js but here just incase

// if (alreadyAsked.length > 0) {
//   console.log('already ask check done in send_bonus');
//   const alreadyDoneMessage = commandFactory('slack')
//     .setOperation('ephemeralMessage')
//     .setUser(user_id)
//     .setChannel(channel_id)
//     .setText(`You've already answered a bonus for this round!`)
//     .save();

//   return await exec.one(slack, alreadyDoneMessage);
// }
