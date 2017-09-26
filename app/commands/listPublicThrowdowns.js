const { User, Throwdown } = require('../models')
const { single_throwdown } = require('../messages')

module.exports = (body) => {
  const {name, team_id, user_name, user_id, channel_id} = body

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
        if(td.privacy === 'public') {
          attachments.push(single_throwdown(td, user_id))
        }
      })
      const message = {
        type: 'chat.message',
        team_id,
        user_id,
        channel_id,
        text: 'Here are all the throwdowns in which you are a participant',
        attachments
      }
      return message
    })
    .catch(err => err)
}
