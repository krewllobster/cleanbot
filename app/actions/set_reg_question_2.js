const { upsertUser } = require('../db_actions')
const messageController = require('../controllers/messageController')
const messageList = require('../messages')

module.exports = (payload, action, res) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id}
  } = payload
  const { value } = action.selected_options[0]


  return upsertUser(
    {user_id, team_id},
    {$set:
      {'profile.Favorite_Color': value}
    }
  )
  .then(user => {
    console.log('user updated with previous question')
    console.log(user)
    const message = {
      text: `Awesome, now I know what color your ${user.profile.Desert_Island} should be!`,
      type: 'chat.update',
      message_ts,
      channel_id,
      attachments: [
        messageList.registration_complete()
      ]
    }
    return message
  })
  .then(message => {
    return messageController(message, res)
  })
  .catch(err => {
    console.log('error setting user question::' + err)
    return err
  })
}
