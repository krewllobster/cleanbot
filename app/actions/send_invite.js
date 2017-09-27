const multiMessageController = require('../controllers/multiMessageController')

module.exports = (payload, action, res) => {
  console.log(payload)
  console.log(action)
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id}
  } = payload

  const throwdown_id = action.name
  const user_to_invite = action.selected_options[0].value

  const message = {
    type: 'chat.dm',
    client: 'botClient',
    text: 'would you like to join?',
    user_id: user_to_invite,
  }

  multiMessageController([message], res)

}
