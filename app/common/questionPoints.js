module.exports = ({ correct, duration, bonus, difficulty }) => {
  const diffPointsCorrect = {
    easy: 30,
    medium: 40,
    hard: 50,
    unknown: 50
  };

  const diffPointsIncorrect = {
    easy: -20,
    medium: -10,
    hard: 0,
    unknown: 0
  };

  const diffDurations = {
    easy: 3,
    medium: 2,
    hard: 1,
    unknown: 2
  };

  if (bonus && correct) return 20;
  if (bonus && !correct) return 0;

  let points =
    (correct
      ? diffPointsCorrect[difficulty]
      : diffPointsIncorrect[difficulty]) -
    duration * diffDurations[difficulty];
  if (correct && points <= 10) points = 10;
  if (!correct && points <= -20) points = -20;
  return correct ? Math.ceil(points) : Math.floor(points);
};
