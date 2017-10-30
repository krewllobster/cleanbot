
module.exports = (token) => {
  return token === process.env.SLACK_VERIFICATION_TOKEN
}
