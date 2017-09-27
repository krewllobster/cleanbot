const multiMessageController = require('../controllers/multiMessageController')
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
      return messageList.add_category({_id})
    })
    .then(attachment => {
      let new_message = {
        client: 'botClient',
        type: 'chat.message',
        user_id,
        channel_id,
        attachments: [attachment]
      }

      let repl_message = {
        client: 'botClient',
        text: `This throwdown has been set to: ${privacy}`,
        type: 'chat.update',
        message_ts,
        channel_id,
        attachments: []
      }

      return multiMessageController([repl_message, new_message], res)
    })
    .then(([replace_response, new_response]) => {
      console.log(replace_response)
      console.log(new_response)
      console.log('messages sent')
    })
    .catch(err => {
      console.log('error in set throwdown privacy flow::' + err)
      return err
    })
}
