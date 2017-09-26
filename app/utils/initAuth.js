const verifyToken = require('./verifyToken')
const checkOpt = require('./checkOpt')

module.exports = ({token, user_id, team_id}) => {
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
