const { User, Throwdown } = require('../models')
const { all_public_throwdowns } = require('../messages')
const multiMessageController = require('../controllers/multiMessageController')

module.exports = (body, res) => {
  const {name, team_id, user_name, user_id, channel_id} = body

  const processing = {
    type: 'chat.dm',
    client: 'botClient',
    user_id,
    text: 'Processing...'
  }

  const updateInfo = multiMessageController([processing], res)
  const attachments = all_public_throwdowns({team_id, user_id})

  Promise.all([updateInfo, attachments])
    .then(([[updateInfo], attachments]) => {
      console.log(updateInfo)
      const message = {
        type: 'chat.update',
        client: 'botClient',
        channel_id: updateInfo.channel,
        message_ts: updateInfo.ts,
        text: 'Public Throwdowns',
        attachments
      }

      if (attachments.length === 0) {
        message.text = `It looks like there aren't any public Throwdowns yet!`
      }

      return multiMessageController([message], res)
    })
    .then(responses => {
      console.log('messages sent')
      console.log(responses)
    })
    .catch(err => {
      console.log('error sending messages::' + err)
    })
}
