const { User } = require('../models')

module.exports = (matchFields, updateFields) => {
  return User.findOneAndUpdate(
    matchFields,
    updateFields,
    {upsert: true, new: true}
  )
  .then(user => {
    return user
  })
  .catch(err => {
    return err
  })
}
