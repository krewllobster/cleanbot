const { upsertThrowdown } = require('../db_actions')
const messageController = require('../controllers/messageController')
const messageList = require('../messages')

module.exports = (payload, action, res) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id}
  } = payload

  const { _id, add } = JSON.parse(action.value)

  let message = {
    user_id,
    team_id,
    channel_id,
    type: 'chat.message'
  }

  if (add) {
    messageList.add_category({_id})
      .then(attachment => {
        const message = {
          message_ts,
          channel_id,
          type: 'chat.update',
          attachments: [attachment]
        }
        messageController(message, res)
      })
  } else {
    const message = {
      user_id,
      team_id,
      channel_id,
      type: 'chat.message',
      text: 'ok, finishing setup'
    }
    messageController(message, res)
  }
}
