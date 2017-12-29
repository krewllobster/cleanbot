const { formatBonusQuestion } = require('../attachments');

module.exports = async (payload, action, deps) => {
  const {
    user: { id: user_id },
    team: { id: team_id },
    message_ts,
    channel: { id: channel_id },
    original_message
  } = payload;

  const { throwdown_id, round } = JSON.parse(action.value);

  const { slack, dbInterface, commandFactory, exec, user } = deps;

  //find existing user data responses
  //filter out already asked questions
  const getUserData = commandFactory('db')
    .setEntity('UserData')
    .setMatch({ user_id, team_id })
    .setOperation('find')
    .save();

  const getBonusQuestions = commandFactory('db')
    .setEntity('Bonus')
    .setOperation('find')
    .setMatch({})
    .save();

  const [bonusQuestions, userData] = await exec
    .many([[dbInterface, getBonusQuestions], [dbInterface, getUserData]])
    .catch(err => console.log(err));

  const responses = userData.map(d => d.bonus.toString());
  console.log(responses);

  const alreadyAsked = userData.filter(
    d => d.throwdown.toString() == throwdown_id && d.round == round
  );

  if (alreadyAsked) {
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

  //TODO: ADD QUESTIONS IF NO BONUSES LEFT OR IF ROUND%2 == 0
  if (notAsked.length === 0 || round % 2 === 0) {
    const willAddLater = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setText('placeholder for question about coworkers')
      .setUser(user_id)
      .setChannel(channel_id)
      .save();

    return await exec.one(slack, willAddLater);
  }

  const bonusAttachment = formatBonusQuestion(notAsked[0], {
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
};
