const { brandColor } = require('../constants');

module.exports = (throwdown, user, opts = { round: null }) => {
  const { round } = opts;
  return {
    text: `<!channel>: It's on! Click below to get your questions for round ${round
      ? round
      : throwdown.round} -- they'll appear at the bottom of this channel.`,
    callback_id: 'send_question_list',
    actions: [
      {
        color: brandColor,
        name: 'Get Questions',
        text: `Get my round ${throwdown.round} questions!`,
        value: JSON.stringify({
          throwdown_id: throwdown._id,
          user,
          round: round ? round : throwdown.round
        }),
        type: 'button'
      }
    ]
  };
};
