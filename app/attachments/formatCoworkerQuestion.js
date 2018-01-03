const { shuffle } = require('../common');
const { brandColor } = require('../constants');

const formatPreference = data => {
  const questionText = data.bonus.text.replace(
    ' you ',
    ` *<@${data.user_id}>* `
  );
  const questionActions = data.bonus.options.map(o => ({
    name: o,
    text: o == 'I like both!' ? `Both of them!` : o,
    value: JSON.stringify({
      throwdown_id: data.throwdown,
      round: data.round,
      question: data.bonus,
      correct: o == data.response,
      bonus: true,
      requested: new Date()
    }),
    type: 'button'
  }));

  return [
    {
      color: brandColor,
      text: questionText,
      callback_id: 'check_answer',
      fallback: 'You have a new question to answer',
      actions: questionActions,
      mrkdwn_in: ['text']
    }
  ];
};

module.exports = {
  preference(data) {
    return formatPreference(data);
  },
  experience(data) {
    return formatExpeience(data);
  }
};
