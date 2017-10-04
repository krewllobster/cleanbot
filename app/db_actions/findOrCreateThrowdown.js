const { Throwdown, User } = require('../models')

module.exports = ({name, team_id, user_id}) => {
  return User.findOne({user_id, team_id})
    .then(user => {
      console.log('user found when creating throwdown')
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
