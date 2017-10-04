const dialogs = require('../dialogs')
const multiMessageController = require('../controllers/multiMessageController')

module.exports = (payload, action, res) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    trigger_id,
    channel: {id: channel_id}
  } = payload

  const { name } = action

  let message

  if (name === 'register') {
    message = {
      type: 'dialog.open',
      client: 'botClient',
      dialog: dialogs.registration(),
      trigger_id,
    }
  }

  if (name === 'ignore') {
    message = {
      type: 'chat.update',
      client: 'botClient',
      message_ts,
      channel_id,
      text: 'Ok, ignored!',
      attachments: []
    }
  }

  multiMessageController([message], res)
    .then(response => console.log(response))
    .catch(err => {
      console.log('error sending reg form::' + err)
    })
}
