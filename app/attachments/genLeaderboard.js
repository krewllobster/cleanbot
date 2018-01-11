const { Response, Throwdown } = require('../models');
const { questionPoints } = require('../common');
const mongoose = require('mongoose');
const d3 = require('d3');

const genLeaderBoard = async throwdown_id => {
  console.log('attempting aggregation');
  const allData = await Response.aggregate([
    {
      $match: { throwdown: mongoose.Types.ObjectId(throwdown_id) }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'fullUser'
      }
    },
    {
      $lookup: {
        from: 'questions',
        localField: 'question',
        foreignField: '_id',
        as: 'fullQuestion'
      }
    },
    { $addFields: { user_name: '$fullUser.display_name' } },
    { $addFields: { question_text: '$fullQuestion.text' } },
    { $addFields: { question_difficulty: '$fullQuestion.difficulty' } },
    { $unwind: '$user_name' },
    { $unwind: '$question_text' }
    // {
    //   $group: {
    //     _id: {
    //       user: '$user_name',
    //       round: '$round',
    //       correct: '$correct',
    //       question: '$question_text'
    //     },
    //     count: { $sum: 1 },
    //     time: { $sum: '$duration' },
    //     average: { $avg: '$duration' }
    //   }
    // }
  ]);
  const tdData = await Throwdown.findOne(
    { _id: throwdown_id },
    { questions: 0 }
  );
  //TODO: use object.assign to add points to everyting
  // const byUsersByPoints = allData.map(d => {
  //   const { user, round, question, correct } = d._id;
  //   const { count, average, time } = d;
  //   let points = (correct ? 50 : 0) - parseFloat(d.time.toFixed(0));
  //   if (correct && points <= 10) points = 10;
  //   if (!correct && points <= -20) points = -20;
  //   return {
  //     user,
  //     round,
  //     question,
  //     count,
  //     time,
  //     average,
  //     correct,
  //     points
  //   };
  // });

  // const leaderBoardData = byUsersByPoints.reduce((curr, data) => {
  //   if (curr.hasOwnProperty(data.user)) {
  //     curr[data.user].points += data.points;
  //     curr[data.user].rounds[data.round] += data.points;
  //   } else {
  //     curr[data.user] = {
  //       points: data.points,
  //       rounds: {
  //         '1': 0,
  //         '2': 0,
  //         '3': 0,
  //         '4': 0,
  //         '5': 0,
  //         '6': 0,
  //         '7': 0,
  //         '8': 0,
  //         '9': 0,
  //         '10': 0
  //       }
  //     };
  //   }
  //   return curr;
  // }, {});
  console.log('calculating simple data');
  const dataReduced = allData.reduce((obj, r) => {
    const forPoints = {
      correct: r.correct,
      duration: r.duration,
      bonus: r.bonus,
      difficulty: r.question_difficulty
    };
    let points = questionPoints(forPoints);
    let name = r.user_name;
    let currentPoints = obj[name] || 0;
    obj[name] = currentPoints + points;
    return obj;
  }, {});

  const simpleData = Object.keys(dataReduced).map(k => {
    return { user: k, points: dataReduced[k] };
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

  // const headers = [
  //   'user',
  //   'r1',
  //   'r2',
  //   'r3',
  //   'r4',
  //   'r5',
  //   'r6',
  //   'r7',
  //   'r8',
  //   'r9',
  //   'r10',
  //   'total'
  // ];
  // const flatLeaderBoardData = [
  //   headers,
  //   ...Object.keys(leaderBoardData).map(k => {
  //     const d = leaderBoardData[k];
  //     const rounds = Array.from(Object.values(leaderBoardData[k].rounds));
  //     return [k, ...rounds, d.points];
  //   })
  // ];
  return full;
};

module.exports = genLeaderBoard;
