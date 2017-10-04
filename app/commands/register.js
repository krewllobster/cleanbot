const dialogs = require('../dialogs')
const multiMessageController = require('../controllers/multiMessageController')

module.exports = async (body, res) => {

  const {name, team_id, channel_id, user_name, user_id, trigger_id} = body

  const processing = {
    type: 'chat.dm',
    client: 'botClient',
    user_id,
    text: 'Processing new registration...'
  }

  const [{channel, ts}] = await multiMessageController([processing], res)

  const delete_message = {
    type: 'chat.delete',
    client: 'botClient',
    message_ts: ts,
    channel_id: channel
  }

  const dialog = {
    type: 'dialog.open',
    client: 'webClient',
    trigger_id,
    dialog: dialogs.registration(),
  }

  multiMessageController([delete_message, dialog], res)
}
