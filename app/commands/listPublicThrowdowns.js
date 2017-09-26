const { User, Throwdown } = require('../models')
const { single_throwdown } = require('../messages')

module.exports = (body) => {
  const {name, team_id, user_name, user_id, channel_id} = body

  return User.findOne({user_id, team_id})
    .populate({
      path: 'throwdowns',
      populate: {
        path: 'created_by'
      }
    })
    .populate({
      path: 'throwdowns',
      populate: {
        path: 'participants'
      }
    })
    .populate({
      path: 'throwdowns',
      populate: {
        path: 'categories'
      }
    })
    .then(user => {
      console.log(user)
      let attachments = []
      user.throwdowns.forEach(td => {
        if (td.privacy === 'public') {
          attachments.push(single_throwdown(td, user_id))
        }
      })
      const message = {
        type: 'chat.message',
        team_id,
        user_id,
        channel_id,
        text: 'Here are all of the public Throwdowns!',
        attachments
      }

      return message
    })
    .catch(err => {
      return err
    })

}
