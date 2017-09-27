const {Throwdown} = require('../models')
const single_throwdown = require('./single_throwdown')

module.exports = ({user_id, team_id}) => {
  return Throwdown.find({team_id})
    .populate('created_by')
    .populate('participants')
    .populate('categories')
    .exec()
    .catch(err => {
      return err
    })
    .then(throwdowns => {
      let attachments = []
      throwdowns.forEach(td => {
        if(td.participants.some(p => p.user_id === user_id)) {
          attachments.push(single_throwdown(td, user_id))
        }
      })
      return attachments
    })
    .catch(err => {
      return err
    })
}
