const { findFullThrowdown } = require('../db_actions')
const multiMessageController = require('../controllers/multiMessageController')
const messageList = require('../messages')

module.exports = ({
  message_ts,
  user_id,
  team_id,
  channel_id,
  throwdown_id
}, res) => {
  return findFullThrowdown({_id: throwdown_id})
    .then(throwdown => {
      let attachment = messageList.throwdown_invite(throwdown)

      let message = {
        type: 'chat.dm',
        client: 'botClient',
        user_id,
        channel_id,
        text: `Invite a user to Throwdown "${throwdown.name}"`,
        attachments: attachment
      }

      return multiMessageController([message], res)
    })
    .then(response => {
      console.log('message sent')
      console.log(response)
    })
    .catch(err => {
      console.log('error sending invite list::' + err)
      return err
    })
}
