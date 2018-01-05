const { shuffle } = require('../common');
const { brandColor } = require('../constants');

module.exports = ({ throwdown_id, question, round }) => {
  let actions = [];
  //TODO: alternative formatting for bonus question to consolidate
  const longestAnswer = question.answers
    .map(a => a.text.length)
    .reduce((p, v) => (v > p ? v : p));
  const longestAllowed = 20;
  const shuffledAnswers = shuffle(question.answers);
  const questionText = `Question: ${question.text}`;
  const answersInText = shuffledAnswers.reduce((acc, val, i) => {
    return acc + `\n${String.fromCharCode(65 + i)}: ${val.text}`;
  }, ``);

  shuffledAnswers.forEach((a, i) => {
    actions.push({
      name: a.text,
      text:
        longestAnswer > longestAllowed ? String.fromCharCode(65 + i) : a.text,
      value: JSON.stringify({
        throwdown_id,
        round,
        question,
        correct: a.correct,
        requested: new Date()
      }),
      type: 'button'
    });
  });

  return [
    {
      color: brandColor,
      text:
        longestAnswer > longestAllowed
          ? `${questionText}${answersInText}`
          : questionText,
      callback_id: 'check_answer',
      fallback: 'You have a new question to answer',
      actions: actions
    }
  ];
};
