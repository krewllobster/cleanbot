const dialogs = require('../dialogs')
const multiMessageController = require('../controllers/multiMessageController')

module.exports = (body, res) => {

  const {name, team_id, channel_id, user_name, user_id, trigger_id} = body

  const processing = {
    type: 'chat.dm',
    client: 'botClient',
    user_id,
    text: 'Processing...'
  }

  multiMessageController([processing], res)
    .then(([response]) => {

      const delete_message = {
        type: 'chat.delete',
        client: 'botClient',
        message_ts: response.ts,
        channel_id: response.channel
      }

      const dialog = {
        type: 'dialog.open',
        client: 'webClient',
        trigger_id,
        dialog: dialogs.registration(),
      }

      return multiMessageController([delete_message, dialog], res)
    })
    .then(responses => {
      console.log(responses)
    })
    .catch(err => {
      console.log('error in register command::' + err)
      return err
    })
}
