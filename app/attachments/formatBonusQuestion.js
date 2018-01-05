const { shuffle } = require('../common');
const { brandColor } = require('../constants');

const formatFunctions = {
  preference({ throwdown_id, question, round }) {
    let actions = [];
    //TODO: alternative formatting for bonus question to consolidate
    const longestAnswer = question.answers
      .map(a => a.text.length)
      .reduce((p, v) => (v > p ? v : p));
    const longestAllowed = 20;
    const shuffledAnswers = shuffle(question.answers);
    const questionText = `Question: ${question.text}`;
    const answersInText = question.answers.reduce((acc, val, i) => {
      return acc + `\n${String.fromCharCode(65 + i)}: ${val.text}`;
    }, ``);

    let buttons = [];
    let dropdownOptions = [];

    question.answers.forEach((a, i) => {
      let value = JSON.stringify({
        throwdown_id,
        round,
        question,
        response: a.text
      });

      buttons.push({
        name: a.text,
        text:
          longestAnswer > longestAllowed ? String.fromCharCode(65 + i) : a.text,
        value,
        type: 'button'
      });

      dropdownOptions.push({
        text: a.text,
        value
      });
    });

    const dropdown = [
      {
        type: 'select',
        text: 'select an option',
        name: question.shortName,
        options: dropdownOptions
      }
    ];

    return [
      {
        color: brandColor,
        text:
          longestAnswer > longestAllowed
            ? `${questionText}${answersInText}`
            : questionText,
        callback_id: 'save_user_data',
        fallback: 'You have a new question to answer',
        actions: dropdownOptions.length > 5 ? dropdown : buttons
      }
    ];
  }
};

module.exports = ({ throwdown_id, question, round }) => {
  console.log(question);
  return formatFunctions[question.questionType]({
    throwdown_id,
    question,
    round
  });
};
