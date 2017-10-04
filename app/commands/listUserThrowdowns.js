const { User, Throwdown } = require('../models')
const { all_user_throwdowns } = require('../messages')

module.exports = (body) => {
  const {name, team_id, user_name, user_id, channel_id} = body

  return all_user_throwdowns({team_id, user_id})
    .then(attachments => {
      const message = {
        type: 'chat.dm',
        client: 'botClient',
        team_id,
        user_id,
        channel_id,
        text: 'Your Throwdowns',
        attachments
      }

      if (attachments.length === 0) {
        message.text = 'You are not a participant in any Throwdowns at the moment.'
      }
      return message
    })
    .catch(err => err)
}
