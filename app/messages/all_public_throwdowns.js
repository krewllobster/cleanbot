const {Throwdown} = require('../models')
const single_throwdown = require('./single_throwdown')

module.exports = ({user_id, team_id}) => {
  return Throwdown.find({team_id})
    .populate('created_by')
    .populate('participants')
    .populate('categories')
    .populate('invitees')
    .exec()
    .then(throwdowns => {
      let attachments = []
      console.log('throwdown list length ++++++++++')
      console.log(throwdowns.length)
      throwdowns.forEach(td => {
        if(td.privacy === 'public') {
          attachments.push(single_throwdown(td, user_id))
        }
      })
      return attachments
    })
    .catch(err => {
      return err
    })
}
