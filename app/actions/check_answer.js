const { findFullThrowdown, questionPoints } = require('../common');
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

  let { throwdown_id, round, question, correct, requested } = JSON.parse(
    action.value
  );

  const { slack, dbInterface, commandFactory, exec, user } = deps;

  if (!requested) requested = new Date();

  const submitted = new Date();

  let duration =
    (new Date(submitted).getTime() - new Date(requested).getTime()) / 1000;

  requested ? (duration = parseFloat(duration.toFixed(3))) : 0;

  let match = {
    user: user._id,
    question: question._id,
    throwdown: throwdown_id,
    round
  };

  let update = {
    category: question.category,
    correct,
    round,
    requested,
    submitted,
    duration,
    responded: true,
    bonus: question.bonus
  };

  const getExistingResponse = commandFactory('db')
    .setEntity('Response')
    .setOperation('findOne')
    .setMatch(match)
    .save();

  const exRes = await exec.one(dbInterface, getExistingResponse);

  if (exRes && exRes.responded) {
    const sendAlreadyResponded = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setUser(user_id)
      .setChannel(channel_id)
      .setText(`You've already answered this question`)
      .save();

    return await exec.one(slack, sendAlreadyResponded);
  }

  const updateResponse = commandFactory('db')
    .setEntity('Response')
    .setOperation('findOneAndUpdate')
    .setMatch(match)
    .setUpdate(update)
    .setOptions({ upsert: true, new: true })
    .save();

  const updatedResponseRes = await exec.one(dbInterface, updateResponse);

  const forPoints = {
    correct: updatedResponseRes.correct,
    duration: updatedResponseRes.duration,
    bonus: updatedResponseRes.bonus,
    difficulty: question.difficulty
  };

  const points = questionPoints(forPoints);

  let nextQuestions = await selectQuestionButtons(throwdown_id, round, deps);

  let answerText = correct
    ? `Congratulations! You answered correctly ${
        !question.bonus ? `in ${duration} seconds` : ''
      } for ${points} points!`
    : `Whoops...you spent ${duration} seconds thinking...only to get it wrong for ${points} points :/`;

  if (nextQuestions[0].actions.length === 0) {
    answerText += `\nYou're out of questions. Check out your leaderboard here: ${
      process.env.URL_BASE
    }/leaderboards/${throwdown_id}`;
  }

  let answer = {
    text: answerText,
    color: correct ? '#04D34F' : '#F70400'
  };

  const newAnswer = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setChannel(channel_id)
    .setUser(user_id)
    .setText('')
    .setAttachments([answer, ...nextQuestions])
    .save();

  exec.one(slack, newAnswer);
};
