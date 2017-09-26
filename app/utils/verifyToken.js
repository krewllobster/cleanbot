

module.exports = (token) => {
  return new Promise((resolve, reject) => {
    if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
      reject(new Error('Incorrect Slack verification token'))
    } else {
      console.log('token verified')
      resolve(true)
    }
  })
}
