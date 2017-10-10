const { findFullThrowdown } = require('../db_actions')
const multiMessageController = require('../controllers/multiMessageController')
const messageList = require('../messages')

module.exports = async ({
  message_ts,
  user_id,
  team_id,
  channel_id,
  throwdown_id
}, res) => {

  const throwdown = await findFullThrowdown({_id: throwdown_id})
  const attachment = messageList.throwdown_invite(throwdown)

  const message = {
    type: 'chat.dm',
    client: 'botClient',
    user_id,
    channel_id,
    text: `Invite a user to Throwdown "${throwdown.name}"`,
    attachments: attachment
  }

  return multiMessageController([message], res)
}
