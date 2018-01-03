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

  const {
    throwdown_id,
    round,
    question,
    correct,
    bonus,
    requested
  } = JSON.parse(action.value);

  const { slack, dbInterface, commandFactory, exec, user } = deps;

  const submitted = new Date();

  let duration =
    (new Date(submitted).getTime() - new Date(requested).getTime()) / 1000;

  requested ? (duration = parseFloat(duration.toFixed(3))) : 0;

  let created, newResponse;

  if (bonus) {
    const bonusRes = await Response.findOrCreate(
      {
        user: user._id,
        bonusQuestion: question._id,
        throwown: throwdown_id
      },
      {
        category: 1,
        correct,
        round,
        bonus: true,
        requested,
        submitted,
        duration
      }
    );

    created = bonusRes.created;
    newResponse = bonusRes.doc;
  } else {
    let questionRes = await Response.findOrCreate(
      {
        user: user._id,
        question: question._id,
        throwdown: throwdown_id
      },
      {
        category: question.category,
        correct,
        round,
        bonus: false,
        requested,
        submitted,
        duration
      }
    );
    created = questionRes.created;
    newResponse = questionRes.doc;
  }

  const points = questionPoints(newResponse);

  if (!created) {
    const alreadyAnswered = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setChannel(channel_id)
      .setUser(user_id)
      .setText('You have already answered this question!')
      .save();

    return await exec.one(slack, alreadyAnswered);
  }

  let nextQuestions = await selectQuestionButtons(throwdown_id, round, deps);

  let answerText = correct
    ? `Congratulations! You answered correctly in ${duration} seconds for ${points} points!`
    : `Whoops...you spent ${duration} seconds thinking...only to get it wrong for ${points} points :/`;

  if (nextQuestions[0].actions.length === 0) {
    answerText += `\nYou're out of questions. Check out your leaderboard here: ${process
      .env.URL_BASE}/leaderboards/${throwdown_id}`;
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
