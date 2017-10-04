const { User } = require('../models')

module.exports = (matchFields) => {
  return User.findOne(matchFields)
    .then(user => {
      console.log('finding one user')
      console.log(user)
      return user
    })
}
