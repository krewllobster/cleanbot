const { findFullThrowdown } = require('../common');
const { selectQuestionButtons, genLeaderboard } = require('../attachments');
const { Response } = require('../models');

module.exports = async (payload, action, deps) => {
  console.log('checking answers');
  const {
    user: { id: user_id },
    team: { id: team_id },
    message_ts,
    channel: { id: channel_id },
    original_message
  } = payload;

  const {
    throwdown_id,
    channel,
    round,
    question,
    correct,
    requested
  } = JSON.parse(action.value);

  const { slack, dbInterface, commandFactory, exec, user } = deps;

  const submitted = new Date();

  let duration =
    (new Date(submitted).getTime() - new Date(requested).getTime()) / 1000;
  duration = parseFloat(duration.toFixed(3));

  const { created, doc: newResponse } = await Response.findOrCreate(
    {
      user: user._id,
      question: question._id,
      throwdown: throwdown_id
    },
    {
      category: question.category,
      correct,
      round,
      requested,
      submitted,
      duration
    }
  );
  await genLeaderboard(throwdown_id);

  if (!created) {
    const alreadyAnswered = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setChannel(channel_id)
      .setUser(user_id)
      .setText('You have already answered this question!')
      .save();

    return await exec.one(slack, alreadyAnswered);
  }

  let attachments = await selectQuestionButtons(throwdown_id, round, deps);

  let answerText = correct
    ? `Congratulations! You answered correctly in ${duration} seconds!`
    : `Whoops...you spent ${duration} seconds thinking...only to get it wrong`;

  if (attachments[0].actions.length === 0) {
    answerText += `\nYou're out of questions. Check out your leaderboard here: https://peaceful-stream-90290.herokuapp.com/leaderboards/${throwdown_id}`;
  }

  const newAnswer = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setChannel(channel_id)
    .setUser(user_id)
    .setText(answerText)
    .setAttachments(attachments)
    .save();

  exec.one(slack, newAnswer);
};
