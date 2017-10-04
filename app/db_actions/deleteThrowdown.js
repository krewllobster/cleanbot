const { Throwdown, User } = require('../models')

module.exports = (matchFields) => {
  let participants
  return Throwdown.findOneAndRemove(matchFields)
    .then(deleted => {
      console.log('throwdown deleted')
      return deleted
    })
    .then(deleted => {
      participants = deleted.participants
      return User.updateMany(
        {_id: {"$in": participants}},
        {$pull: {throwdowns: deleted._id}}
      )
    })
    .then(result => {
      console.log('users updated')
      return result
    })
}
