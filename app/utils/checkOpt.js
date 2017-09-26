const { User } = require('../models')

module.exports = ({user_id, team_id}) => {
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
