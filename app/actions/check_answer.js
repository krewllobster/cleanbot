const { findFullThrowdown, questionPoints } = require('../common');
const {
  selectQuestionButtons,
  genLeaderboard,
  roundSummary
} = require('../attachments');
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

  const nextQuestions = await selectQuestionButtons(throwdown_id, round, deps);

  const durationText =
    duration > 60
      ? `${(duration / 60).toFixed(2)} minutes`
      : `${duration} ${duration === 1 ? 'second' : 'seconds'}`;

  let answerText = correct
    ? `Congratulations! You answered correctly ${
        !question.bonus ? `in ${durationText}` : ''
      } for ${points} points!`
    : `Whoops...you spent ${durationText} thinking...only to get it wrong for ${points} points :/`;

  let answer = {
    text: answerText,
    color: correct ? '#04D34F' : '#F70400'
  };

  const attachmentsToSend = [answer];
  console.log('nextQuestions to send ------');
  console.log(nextQuestions);
  if (
    !nextQuestions ||
    nextQuestions[0].actions.length === 0 ||
    nextQuestions[0].callback_id == 'leaderboard' ||
    nextQuestions[0].callback_id == 'send_question_list'
  ) {
    let rSummary = await roundSummary({ throwdown: throwdown_id, round }, deps);
    console.log(rSummary);
    if (rSummary) {
      attachmentsToSend.push(rSummary);
    }
  }

  attachmentsToSend.push(...nextQuestions);

  const newAnswer = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setChannel(channel_id)
    .setUser(user_id)
    .setText('')
    .setAttachments(attachmentsToSend)
    .save();

  return await exec.one(slack, newAnswer);
};
