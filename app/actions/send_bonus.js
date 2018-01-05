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
  console.log('round from send_bonus.js action.value', round);
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
    .setPopulate('bonus')
    .save();

  const getBonusQuestions = commandFactory('db')
    .setEntity('Bonus')
    .setOperation('find')
    .setMatch({})
    .save();

  const [bonusQuestions, userData, { participants }] = await exec
    .many([
      [dbInterface, getBonusQuestions],
      [dbInterface, getUserData],
      [dbInterface, getParticipants]
    ])
    .catch(err => console.log(err));

  console.log(userData);

  const isUser = f => f.user_id == user_id;
  const notUser = f => f.user_id != user_id;
  const matchUser = id => f => f.user == id.toString();

  const responses = userData.filter(isUser).map(d => d.bonus._id.toString());

  const alreadyAsked = userData
    .filter(isUser)
    .filter(d => d.throwdown.toString() == throwdown_id && d.round == round);

  const unAskedCoworkerQuestions = userData.filter(notUser);

  if (alreadyAsked.length > 0) {
    const alreadyDoneMessage = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setUser(user_id)
      .setChannel(channel_id)
      .setText(`You've already answered a bonus for this round!`)
      .save();

    return await exec.one(slack, alreadyDoneMessage);
  }

  const notAsked = bonusQuestions.filter(
    b => !responses.includes(b._id.toString())
  );

  if (
    notAsked.length === 0 ||
    (round % 2 === 0 && unAskedCoworkerQuestions.length > 0)
  ) {
    const bonusPlayer = shuffle(
      participants.filter(i => i != user._id.toString())
    )[0];
    console.log(bonusPlayer);
    if (!bonusPlayer) {
      console.log('throwdown cant start without at least 2 people');
      return new Error('Throwdown has only 1 participant');
    }

    const coWorkerData = shuffle(userData.filter(matchUser(bonusPlayer)))[0];
    const qType = coWorkerData.bonus.questionType;
    console.log('round before calling format coworker function ', round);
    const formattedQuestion = formatCoworkerQuestion[qType](
      coWorkerData,
      round
    );
    console.log('formatted question from coworker question');
    console.log(formattedQuestion[0]);
    const sendCoworkerQuestion = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setText(`Bonus question for round ${round}`)
      .setUser(user_id)
      .setChannel(channel_id)
      .setAttachments(formattedQuestion)
      .save();

    return await exec.one(slack, sendCoworkerQuestion);
  }

  const b = shuffle(notAsked)[0];
  const bonusType = b.answerType;

  if (bonusType == 'mc') {
    console.log('sending multiple choice bonus');
    let bonusAttachment = formatBonusQuestion(b, {
      user,
      throwdown: throwdown_id,
      round
    });
    const bonusMessage = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setUser(user_id)
      .setChannel(channel_id)
      .setText('')
      .setAttachments(bonusAttachment)
      .save();

    return await exec.one(slack, bonusMessage);
  }

  if (bonusType == 'long') {
    console.log('sending longForm bonus');
    let bonusDialog = formatBonusDialog(b, {
      user,
      throwdown: throwdown_id,
      round
    });
    let sendBonusDialog = commandFactory('slack')
      .setOperation('openDialog')
      .setTrigger(trigger_id)
      .setDialog(bonusDialog)
      .save();

    return await exec.one(slack, sendBonusDialog);
  }
};
