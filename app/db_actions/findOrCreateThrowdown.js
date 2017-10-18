const { Throwdown, User } = require('../models')

module.exports = async ({name, team_id, user_id}) => {
  return User.findOne({user_id, team_id})
    .then(user => {
      return Throwdown.findOrCreate(
        {name},
        {
          team_id,
          created_by: user._id,
          participants: [user._id]
        }
      )
    })
    .then(result => {
      return result
    })
    .catch(err => {
      console.log('error in find or create throwdown db_action::' + err)
      return err
    })
}
