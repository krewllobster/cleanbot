const button_actions = require('../button_actions')

module.exports = (payload, action, res) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id},
    original_message,
  } = payload

  const { throwdown_id, command, public } = JSON.parse(action.value)

  console.log(command)

  button_actions[command]({message_ts, user_id, team_id, channel_id, throwdown_id, public}, res)

}
