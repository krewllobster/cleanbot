const { selectQuestionButtons, genLeaderboard } = require('../attachments');
const { findFullThrowdown } = require('../common');

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

  const questionButtonText = `
    Choose a difficulty below to get this round's questions. We'll start timing you when you select a difficulty, and stop the timer when you select an answer.
After you give an answer, you'll see this message again with your remaining questions.\nGood luck!!
  `;
  const noMoreQuestionText = `Look's like you're out of questions for round ${round}!`;

  const questionsToAttach = await selectQuestionButtons(
    throwdown_id,
    round,
    deps
  );

  const questionNumber = questionsToAttach.actions[0].name;

  const sendQuestions = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setChannel(channel_id)
    .setUser(user_id)
    .setAttachments(questionsToAttach)
    .setText(questionNumber ? questionButtonText : noMoreQuestionText)
    .save();

  exec.one(slack, sendQuestions);
};
