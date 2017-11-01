const button_actions = require('../button_actions')

module.exports = (payload, action, deps) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id},
    original_message,
  } = payload

  const { throwdown_id, command: actionName, public } = JSON.parse(action.value)

  console.log('passing to button action: ' + actionName)
  const data = {
    message_ts, user_id, team_id, channel_id,
    throwdown_id, public
  }
  button_actions[actionName](data, deps)
}
