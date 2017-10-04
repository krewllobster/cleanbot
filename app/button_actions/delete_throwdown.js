const multiMessageController = require('../controllers/multiMessageController')
const messageList = require('../messages')
const {
  deleteThrowdown,
  findFullThrowdown
} = require('../db_actions')

const { archiveChannel } = require('../utils')

module.exports = ({
  message_ts,
  user_id,
  team_id,
  channel_id,
  throwdown_id
}, res) => {

  let throwdownToDelete

  findFullThrowdown({_id: throwdown_id})
    .then(throwdown => {
      console.log('setting variable to throwdown')
      throwdownToDelete = throwdown
      console.log(throwdownToDelete)
      return deleteThrowdown({_id: throwdown_id})
    })
    .then(() => {
      let messages = []
      const repl_message = {
        type: 'chat.update',
        client: 'botClient',
        message_ts,
        channel_id,
        text: `Throwdown "${throwdownToDelete.name}" has been deleted`,
        attachments: []
      }
      messages.push(repl_message)

      throwdownToDelete.participants.forEach(p => {
        const message = {
          user_id: p.user_id,
          team_id,
          channel_id,
          type: 'chat.dm',
          client: 'botClient',
          attachments: [
            messageList.throwdown_deleted(throwdownToDelete)
          ]
        }
        if (p.opt_in && p.user_id !== user_id) messages.push(message)
      })
      return multiMessageController(messages, res)
    })
    .then(results => {
      console.log('messages sent to participants')
      console.log(results)
    })
    .catch(err => {
      console.log('error deleting throwdown and sending messages to participants::' + err)
    })
}
