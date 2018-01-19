const { questionPoints } = require('../common');
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
    coworker_id: updatedResponseRes.coworker_id || null,
    difficulty: question.difficulty
  };

  const points = questionPoints(forPoints);

  const getResponses = commandFactory('db')
    .setEntity('Response')
    .setOperation('find')
    .setMatch({ user: user._id })
    .setPopulate('question')
    .save();

  //questions belonging to throwdown
  const getQuestions = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('findOne')
    .setMatch({ _id: throwdown_id })
    .setPopulate([{ path: 'questions.question', model: 'Question' }])
    .save();

  //userData belonging to user from this throwdown
  const getUserData = commandFactory('db')
    .setEntity('UserData')
    .setOperation('find')
    .setMatch({
      user: user._id
    })
    .save();

  const [responses, throwdownQuestions, userData] = await exec.many([
    [dbInterface, getResponses],
    [dbInterface, getQuestions],
    [dbInterface, getUserData]
  ]);

  const nextQuestions = selectQuestionButtons(throwdown_id, round, {
    responses,
    throwdown: throwdownQuestions,
    userData,
    user
  });

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

  if (!!nextQuestions) attachmentsToSend.push(...nextQuestions);

  const newAnswer = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setChannel(channel_id)
    .setUser(user_id)
    .setText('')
    .setAttachments(attachmentsToSend)
    .save();

  return await exec.one(slack, newAnswer);
};
