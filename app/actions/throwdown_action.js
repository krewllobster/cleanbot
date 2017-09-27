const {
  upsertUser,
  deleteThrowdown,
  findFullThrowdown
} = require('../db_actions')

const button_actions = require('../button_actions')

const messageController = require('../controllers/messageController')
const messageList = require('../messages')
const db_actions = require('../db_actions')

module.exports = (payload, action, res) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id},
    original_message,
  } = payload

  const { throwdown_id, command } = JSON.parse(action.value)

  console.log(command)
  console.log(original_message)

  const actions = button_actions(res)

  actions[command]({message_ts, user_id, team_id, channel_id, throwdown_id})

}
