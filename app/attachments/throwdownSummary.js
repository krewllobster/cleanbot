const { questionPoints } = require('../common');

module.exports = (tdResponses, tdUserData, throwdown_id) => {
  let correctCount = 0;
  let correctPoints = 0;
  let bonusCount = 0 + tdUserData.length;
  let bonusPoints = 0 + tdUserData.length * 20;
  let incorrectCount = 0;
  let incorrectPoints = 0;
  let totalDuration = 0;

  tdResponses.forEach(r => {
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

  return {
    color: '#FFDF33',
    text: `It looks like you're done with this throwdown. Here's how you did!`,
    fields: [
      {
        title: `Correct Answers`,
        value: correctCount,
        short: true
      },
      {
        title: `Incorrect Answers`,
        value: incorrectCount,
        short: true
      },
      {
        title: `Total Points Earned`,
        value: `${correctPoints}  -  ${-incorrectPoints} ${
          bonusCount > 0 ? ` +  ${bonusPoints}  ` : ''
        }  =  ${correctPoints + incorrectPoints + bonusPoints} points`,
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
    }/leaderboards/${throwdown_id}`
  };
};