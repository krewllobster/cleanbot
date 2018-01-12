module.exports = throwdown => {
  return `
<!channel> Welcome to the private channel for ${
    throwdown.name
  }. This is where you'll get your questions every day. Each time you request a question, we start timing you -- the faster you answer, the more points you'll get...or the fewer points you'll lose!

There are a few other things you can do in this channel:

  - type "/rumble leaderboard" to get a link to this Throwdown's leaderboard
  - type "/rumble report" to report a question for inappropriate content
  - type "/rumble feedback" to send us your thoughts about our game

Good luck!
  `;
};
