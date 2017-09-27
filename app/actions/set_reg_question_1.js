const { upsertUser } = require('../db_actions')
const multiMessageController = require('../controllers/multiMessageController')
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
    console.log(`${user} desert island set to ${value}`)
    let repl_message = {
      client: 'botClient',
      type: 'chat.update',
      text: `Great! Now I know what to send you when (...if) you're stranded on a desert island!`,
      message_ts,
      channel_id,
      attachments: []
    }

    let new_message = {
      client: 'botClient',
      type: 'chat.message',
      text: 'One last personal question:',
      channel_id,
      attachments: [
        messageList.reg_question_2()
      ]
    }

    return multiMessageController([repl_message, new_message], res)
  })
  .then(response => {
    console.log('message replaced, and new message sent')
  })
  .catch(err => {
    console.log('error setting desert island question::' + err)
    return err
  })
}
