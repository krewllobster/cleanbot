const multiMessageController = require('../controllers/multiMessageController')
const {
  throwdown_deleted,
  all_public_throwdowns,
  all_user_throwdowns
} = require('../messages')
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
  throwdown_id,
  public
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

    if(public) {
      repl_message.attachments = await all_public_throwdowns({user_id, team_id})
    } else {
      repl_message.attachments = await all_user_throwdowns({user_id, team_id})
    }

    messages.push(repl_message)

    throwdownToDelete.participants.forEach(p => {
      if (p.opt_in && p.user_id !== user_id) {
        messages.push({
          type: 'chat.dm',
          client: 'botClient',
          user_id: p.user_id,
          attachments: [
            throwdown_deleted(throwdownToDelete)
          ]
        })
      }
    })
  }

  multiMessageController(messages, res)
}
