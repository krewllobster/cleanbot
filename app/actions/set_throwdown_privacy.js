const messageController = require('../controllers/messageController')
const messageList = require('../messages')
const { upsertThrowdown } = require('../db_actions')
const { createPublicChannel } = require('../utils')

module.exports = (payload, action, res) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id}
  } = payload

  const { _id, privacy } = JSON.parse(action.value)


  return upsertThrowdown({_id}, {privacy})
    .then(throwdown => {
      const message = {
        text: `This throwdown has been set to: ${privacy}`,
        type: 'chat.update',
        message_ts,
        channel_id,
        attachments: []
      }
      return message
    })
    .then(message => {
      return messageController(message, res)
    })
    .then(response => {
      console.log('replacement for privacy sent')
      return messageList.add_category({_id})
        .then(attachment => {
          console.log(attachment)
          return {
            type: 'chat.message',
            team_id,
            user_id,
            channel_id,
            attachments: [
              attachment
            ]
          }
        })
    })
    .then(message => {
      return messageController(message, res)
    })
    .then(response => {
      console.log('category select message sent')
    })
    .catch(err => {
      console.log('error in set throwdown privacy flow::' + err)
      return err
    })
}
