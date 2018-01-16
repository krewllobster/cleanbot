const { questionPoints } = require('../common');

module.exports = async ({ throwdown, round }, deps) => {
  const { slack, dbInterface, commandFactory, exec, user } = deps;

  const getRoundResponses = commandFactory('db')
    .setEntity('Response')
    .setOperation('find')
    .setMatch({ throwdown, round, user })
    .setPopulate('question')
    .save();

  const getPersonalBonuses = commandFactory('db')
    .setEntity('UserData')
    .setOperation('find')
    .setMatch({ throwdown, round, user })
    .setPopulate('question')
    .save();

  const [roundResponses, roundUserData] = await exec.many([
    [dbInterface, getRoundResponses],
    [dbInterface, getPersonalBonuses]
  ]);

  console.log('**round user data**');
  console.log(roundUserData);

  let correctCount = 0;
  let correctPoints = 0;
  let bonusCount = 0 + roundUserData.length;
  let bonusPoints = 0 + roundUserData.length * 20;
  let incorrectCount = 0;
  let incorrectPoints = 0;
  let totalDuration = 0;

  roundResponses.forEach(r => {
    let points = questionPoints({
      correct: r.correct,
      bonus: r.bonus,
      difficulty: r.question.difficulty,
      duration: r.duration
    });
    if (r.bonus && r.correct) {
      bonusCount += 1;
      bonusPoints += points;
    } else if (!r.bonus && r.correct) {
      correctCount += 1;
      correctPoints += points;
      totalDuration += r.duration;
    } else if (!r.bonus && !r.correct) {
      incorrectCount += 1;
      incorrectPoints += points;
      totalDuration += r.duration;
    }
  });

  if (roundResponses.filter(r => !r.bonus).length == 3) {
    return {
      color: '#F35A00',
      text: ``,
      fields: [
        {
          title: `Round ${round} Correct Answers`,
          value: correctCount,
          short: true
        },
        {
          title: `Round ${round} Incorrect Answers`,
          value: incorrectCount,
          short: true
        },
        {
          title: `Total Points Earned for Round ${round}`,
          value: `${correctPoints}  -  ${-incorrectPoints} ${
            bonusCount > 0 ? ` + ${bonusPoints} bonus ` : ''
          }  =  ${correctPoints + incorrectPoints} points`,
          short: true
        },
        {
          title: 'Average Response Time',
          value: `${(totalDuration / (correctCount + incorrectCount)).toFixed(
            2
          )} seconds`,
          short: true
        }
      ],
      footer: `View leaderboard: ${
        process.env.URL_BASE
      }/leaderboards/${throwdown}`
    };
  } else {
    return false;
  }
};
