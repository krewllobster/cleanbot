const { User, Throwdown } = require('../models')
const { all_public_throwdowns } = require('../messages')
const { multiMessageController } = require('../controllers')

module.exports = (body) => {
  const {name, team_id, user_name, user_id, channel_id} = body

  return all_public_throwdowns({team_id, user_id})
    .then(attachments => {
      const message = {
        type: 'chat.dm',
        client: 'botClient',
        team_id,
        user_id,
        channel_id,
        text: 'Public Throwdowns',
        attachments
      }

      if (attachments.length === 0) {
        message.text = `It looks like there aren't any public Throwdowns yet!`
      }

      return message
    })
    .catch(err => err)
}
