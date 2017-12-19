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

  const message = commandFactory('slack')
    .setOperation('basicMessage')
    .setChannel(channel_id)
    .setText('bonus pressed')
    .save();

  await exec.one(slack, message);
};
