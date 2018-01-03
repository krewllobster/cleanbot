module.exports = response => {
  const { correct, duration, bonus } = response;

  if (bonus && correct) return 20;
  if (bonus && !correct) return 0;

  let points = (correct ? 50 : 0) - duration * 3;
  if (correct && points <= 10) points = 10;
  if (!correct && points <= -20) points = -20;
  return correct ? Math.ceil(points) : Math.floor(points);
};
