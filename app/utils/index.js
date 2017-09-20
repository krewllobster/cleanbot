const { User, Team } = require('../models')

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
      reject(new Error('Incorrect Slack verification token'))
    } else {
      console.log('token verified')
      resolve(true)
    }
  })
}

const checkOpt = ({user_id, team_id}) => {
  return User.findOne({user_id, team_id})
    .then(user => {
      if (user) {
        console.log('user found')
        console.log(user)
        return Promise.resolve({registered: true, opt_in: user.opt_in})
      } else {
        console.log('no user found')
        return Promise.resolve({registered: false, opt_in: true})
      }
    })
    .catch(err => {
      return err
    })
}

const initAuth = ({token, user_id, team_id}) => {
  const tokVer = verifyToken(token)
  const optVer = checkOpt({user_id, team_id})
  return Promise.all([tokVer, optVer])
    .then(([tok, opt]) => {
      if (!tok) return false
      return optVer
    })
    .catch(err => {
      console.log('error in initAuth')
      return false
    })
}

module.exports = {
  verifyToken,
  checkOpt,
  initAuth,
}
