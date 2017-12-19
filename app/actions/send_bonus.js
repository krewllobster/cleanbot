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

  const getBonusQuestions = commandFactory('db')
    .setEntity('Bonus')
    .setOperation('find')
    .setMatch({})
    .save();

  const bonusQuestions = await exec.one(dbInterface, getBonusQuestions);

  console.log(bonusQuestions);
};
