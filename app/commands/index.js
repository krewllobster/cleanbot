module.exports = {
  new: require('./createThrowdown'),
  'new throwdown': require('./createThrowdown'),
  throwdowns: require('./listPublicThrowdowns'),
  list: require('./listPublicThrowdowns'),
  'list throwdowns': require('./listPublicThrowdowns'),
  'all throwdowns': require('./listPublicThrowdowns'),
  'my throwdowns': require('./listUserThrowdowns'),
  leaderboard: require('./sendLeaderBoardLink'),
  report: require('./sendReportDialog'),
  unknown: require('./unknown'),
  feedback: require('./sendFeedback'),
  'send feedback': require('./sendFeedback')
};
