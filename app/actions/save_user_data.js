const { genLeaderboard } = require('../attachments');

module.exports = async (payload, action, deps) => {
  const {
    user: { id: user_id },
    team: { id: team_id },
    message_ts,
    channel: { id: channel_id },
    original_message
  } = payload;

  const { slack, dbInterface, commandFactory, exec, user } = deps;

  let data;

  if (action.value) data = JSON.parse(action.value);

  if (action.selected_options)
    data = JSON.parse(action.selected_options[0].value);

  const { bonus, shortName, response, throwdown, round } = data;
  const throwdown_id = throwdown.toString();
  const newdata = {
    bonus,
    shortName,
    response,
    user_id,
    team_id,
    user: user._id,
    throwdown,
    round
  };

  const saveData = commandFactory('db')
    .setEntity('UserData')
    .setOperation('update')
    .setMatch({
      bonus,
      user: user._id
    })
    .setUpdate(newdata)
    .setOptions({ upsert: true, new: true })
    .save();

  const serverResponse = await exec.one(dbInterface, saveData);

  const { nModified } = serverResponse;

  const successText = `Sweet! This might be part of a future bonus question :)`;
  const updateText = `Ok, apparently you didn't like your last answer! It's ok, we saved this one :)`;
  console.log(serverResponse);

  const successMessage = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setChannel(channel_id)
    .setUser(user_id)
    .setText(
      (nModified > 0 ? updateText : successText) +
        `\n Check your leaderboard here: ${process.env
          .URL_BASE}/leaderboards/${throwdown_id}`
    )
    .save();

  const errorMessage = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setChannel(channel_id)
    .setUser(user_id)
    .setText('Whoops, it looks like something went wrong saving your answer')
    .save();

  if (serverResponse) {
    await genLeaderboard(throwdown_id);
    return await exec.one(slack, successMessage);
  } else {
    return await exec.one(slack, errorMessage);
  }
};
