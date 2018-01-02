const { brandColor } = require('../constants');

module.exports = (throwdown, user, opts = { round: false }) => {
  const { round } = opts;
  console.log('question button: ', round);
  return {
    color: brandColor,
    name: 'Get Questions',
    text: `Round ${round ? round : throwdown.round} questions`,
    value: JSON.stringify({
      throwdown_id: throwdown._id,
      user,
      round: round ? round : throwdown.round
    }),
    type: 'button'
  };
};
