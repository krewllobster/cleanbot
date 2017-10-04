const { User } = require('../models')

module.exports = (matchFields) => {
  return User.findOne(matchFields)
    .then(user => {
      console.log('finding one user')
      return user
    })
    .catch(err => {
      console.log('error finding one user::' + err)
      return err
    })
}
