const multiMessageController = require('../controllers/multiMessageController')
const messageList = require('../messages')
const {
  deleteThrowdown,
  findFullThrowdown
} = require('../db_actions')

const { archiveChannel } = require('../utils')

module.exports = async ({
  message_ts,
  user_id,
  team_id,
  channel_id,
  throwdown_id
}, res) => {

  const throwdownToDelete = await findFullThrowdown({_id: throwdown_id})

  let messages = []

  if(!throwdownToDelete) {
    const err_message = {
      type: 'chat.update',
      client: 'botClient',
      message_ts,
      channel_id,
      text: `It looks like this Throwdown was already deleted.`,
      attachments: []
    }
    messages.push(err_message)
  } else {
    const deleteResponse = await deleteThrowdown({_id: throwdown_id})

    const repl_message = {
      type: 'chat.update',
      client: 'botClient',
      message_ts,
      channel_id,
      text: `Throwdown "${throwdownToDelete.name}" has been deleted.`
    }

    messages.push(repl_message)

    throwdownToDelete.participants.forEach(p => {
      if (p.opt_in && p.user_id !== user_id) {
        messages.push({
          type: 'chat.dm',
          client: 'botClient',
          user_id: p.user_id,
          attachments: [
            messageList.throwdown_deleted(throwdownToDelete)
          ]
        })
      }
    })
  }

  multiMessageController(messages, res)
}
