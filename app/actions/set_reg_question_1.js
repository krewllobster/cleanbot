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

  const { value } = action

  return upsertUser(
    {user_id, team_id},
    {$set:
      {'profile.Desert_Island': value}
    }
  )
  .then(user => {
    console.log('user updated with previous question')
    console.log(user)
    const message = {
      text: `Awesome, now I know what to airdrop you when (...I mean, if) you're stuck alone on a desert island!`,
      type: 'chat.update',
      message_ts,
      channel_id,
      attachments: []
    }
    return message
  })
  .then(message => {
    return messageController(message, res)
  })
  .then(response => {
    console.log(response)
    const message = {
      type: 'chat.message',
      text: 'One last personal question:',
      channel_id,
      attachments: [
        messageList.reg_question_2()
      ]
    }
    return messageController(message, res)
  })
  .then(response => {
    console.log(response)
  })
  .catch(err => {
    console.log('error setting user question::' + err)
    return err
  })
}
