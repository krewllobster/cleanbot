module.exports = ({ correct, duration, bonus, difficulty }) => {
  console.log('question points diff: ', difficulty);
  const diffPoints = {
    easy: 30,
    medium: 50,
    hard: 70,
    unknown: 50
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
    (correct ? diffPoints[difficulty] : 0) -
    duration * diffDurations[difficulty];
  if (correct && points <= 10) points = 10;
  if (!correct && points <= -20) points = -20;
  return correct ? Math.ceil(points) : Math.floor(points);
};
