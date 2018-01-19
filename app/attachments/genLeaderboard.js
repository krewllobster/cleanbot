const { Response, Throwdown, UserData } = require('../models');
const { questionPoints } = require('../common');
const mongoose = require('mongoose');

const genLeaderBoard = async throwdown_id => {
  console.log('attempting aggregation');

  const personalBonuses = await UserData.find({
    throwdown: throwdown_id
  }).populate([
    { path: 'user', model: 'User' },
    { path: 'question', model: 'Question' }
  ]);

  const responses = await Response.find({
    throwdown: throwdown_id
  }).populate([
    { path: 'user', model: 'User' },
    { path: 'question', model: 'Question' }
  ]);

  const reducedData = {};

  responses.forEach(r => {
    let name = r.user.user_name;
    if (!reducedData[name]) reducedData[name] = 0;
    let forPoints = {
      correct: r.correct,
      duration: r.duration,
      bonus: r.bonus,
      coworker_id: r.coworker_id,
      difficulty: r.question.difficulty
    };
    reducedData[name] += questionPoints(forPoints);
  });

  personalBonuses.forEach(b => {
    let name = b.user.user_name;
    if (!reducedData[name]) reducedData[name] = 0;
    reducedData[name] += 20;
  });

  const tdData = await Throwdown.findOne(
    { _id: throwdown_id },
    { questions: 0 }
  );

  const simpleData = Object.keys(reducedData).map(k => {
    return { user: k, points: reducedData[k] };
  });

  const leaderBoardText = simpleData
    .sort((a, b) => b.points - a.points)
    .map((u, i) => {
      return `${i + 1}: ${u.user} with ${u.points} points\n`;
    })
    .join('');

  const metaData = Object.assign({}, tdData._doc, { text: leaderBoardText });
  const full = {
    data: simpleData,
    meta: metaData
  };

  return full;
};

module.exports = genLeaderBoard;
