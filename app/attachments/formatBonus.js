const { shuffle } = require('../common');
const { brandColor } = require('../constants');

const questionFormats = {
  mc: {
    preference({ question, coworker_id, throwdown, round, response }) {
      let actions = [];

      const longestAnswer = question.answers
        .map(a => a.text.length)
        .reduce((p, v) => (v > p ? v : p));
      const longestAllowed = 20;
      const shuffledAnswers = shuffle(question.answers);
      const coworkerText = question.text.replace(
        ' you ',
        ` *<@${coworker_id}>* `
      );

      const questionText = `Question: ${
        coworker_id ? coworkerText : question.text
      }`;

      const answersInText = question.answers.reduce((acc, val, i) => {
        return acc + `\n${String.fromCharCode(65 + i)}: ${val.text}`;
      }, ``);

      let buttons = [];
      let dropdownOptions = [];

      question.answers.forEach((a, i) => {
        let value = JSON.stringify({
          throwdown_id: throwdown.toString(),
          round,
          question,
          response: a.text,
          correct: response ? a.text == response : true
        });

        buttons.push({
          name: a.text,
          text:
            longestAnswer > longestAllowed
              ? String.fromCharCode(65 + i)
              : a.text,
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
          callback_id: coworker_id ? 'check_answer' : 'save_user_data',
          fallback: 'You have a new question to answer',
          mrkdwn_in: ['text'],
          actions: dropdownOptions.length > 5 ? dropdown : buttons
        }
      ];
    }
  }
};
/**
 * Formats a bonus from a response
 * @param {Response with populated question} response
 **/

module.exports = response => {
  const { questionType, answerType } = response.question;

  return questionFormats[answerType][questionType](response);
};
