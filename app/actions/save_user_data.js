const { selectQuestionButtons, roundSummary } = require('../attachments');
const agenda = require('../../producer');

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

  if (action.response) data = action;

  const { question, response, throwdown_id, round } = data;

  const jobData = {
    question_id: question._id,
    shortName: question.shortName,
    response,
    user,
    throwdown: throwdown_id,
    round,
    channel_id
  };

  agenda.now('save user data', jobData);
};
