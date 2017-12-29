const { brandColor } = require('../constants');

module.exports = (throwdown, user, opts = { round: false }) => {
  const { round } = opts;
  console.log('question button: ', round);
  return {
    color: brandColor,
    name: 'Get Questions',
    text: `It's on! Click below to get your questions for round ${round
      ? round
      : throwdown.round} -- they'll appear at the bottom of this channel.`,
    value: JSON.stringify({
      throwdown_id: throwdown._id,
      user,
      round: round ? round : throwdown.round
    }),
    type: 'button'
  };
};
