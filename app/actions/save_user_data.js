const {
  genLeaderboard,
  selectQuestionButtons,
  roundSummary
} = require('../attachments');

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
  console.log(action);

  if (action.value) data = JSON.parse(action.value);

  if (action.selected_options)
    data = JSON.parse(action.selected_options[0].value);

  if (action.response) data = action;

  console.log(data);

  const { question, response, throwdown_id, round } = data;

  const newdata = {
    question: question._id,
    shortName: question.shortName,
    response,
    user_id,
    team_id,
    user: user._id,
    throwdown: throwdown_id,
    round
  };

  const updateResponse = commandFactory('db')
    .setEntity('Response')
    .setOperation('findOneAndUpdate')
    .setMatch({
      question: question._id,
      user: user._id,
      throwdown: throwdown_id,
      round
    })
    .setUpdate({
      responded: true
    })
    .save();

  const saveData = commandFactory('db')
    .setEntity('UserData')
    .setOperation('update')
    .setMatch({
      question: question._id,
      user: user._id
    })
    .setUpdate(newdata)
    .setOptions({ upsert: true, new: true })
    .save();

  const serverResponse = await exec.many([
    [dbInterface, saveData],
    [dbInterface, updateResponse]
  ]);

  // const { nModified } = serverResponse;

  const successText = `Sweet! This might be part of a future bonus question :)`;
  // const updateText = `Ok, apparently you didn't like your last answer! It's ok, we saved this one :)`;
  const questionAttachments = await selectQuestionButtons(
    throwdown_id,
    round,
    deps
  );

  console.log(serverResponse);

  const rSummary = await roundSummary({ throwdown: throwdown_id, round }, deps);

  if (rSummary) questionAttachments.unshift(rSummary);

  const successMessage = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setChannel(channel_id)
    .setUser(user_id)
    .setText(/*nModified > 0 ? updateText : */ successText)
    .setAttachments(questionAttachments)
    .save();

  const errorMessage = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setChannel(channel_id)
    .setUser(user_id)
    .setText(
      'Whoops, it looks like something went wrong saving your answer. Please try again!'
    )
    .setAttachments(questionAttachments)
    .save();

  if (serverResponse) {
    await genLeaderboard(throwdown_id);
    return await exec.one(slack, successMessage);
  } else {
    return await exec.one(slack, errorMessage);
  }
};
