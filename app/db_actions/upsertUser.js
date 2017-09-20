const { User } = require('../models')

module.exports = (body) => {
  const {user_id, team_id} = body
  return User.findOneAndUpdate(
    {team_id, user_id},
    body,
    {upsert: true, new: true}
  )
  .then(user => {
    return user
  })
  .catch(err => {
    return err
  })
}
