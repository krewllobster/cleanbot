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
  console.log('requesting round: ', round);
  const { slack, dbInterface, commandFactory, exec, user } = deps;

  const questionsToAttach = await selectQuestionButtons(
    throwdown_id,
    round,
    deps
  );

  let questionButtonText = `
    Choose a difficulty below to get this round's questions. We'll start timing you when you select a difficulty, and stop the timer when you select an answer.
After you give an answer, you'll see this message again with your remaining questions.\nGood luck!!
  `;

  console.log(questionsToAttach);
  const noQuestions = questionsToAttach.callback_id === 'send_question_list';

  if (noQuestions) {
    questionButtonText = `Look's like you've already answered all of the round ${round} questions!`;
  }

  const sendQuestions = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setChannel(channel_id)
    .setUser(user_id)
    .setAttachments(questionsToAttach)
    .setText(questionButtonText)
    .save();

  exec.one(slack, sendQuestions).catch(e => console.log(e));
};
