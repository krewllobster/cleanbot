const messageController = require('../controllers/messageController')
const messageList = require('../messages')
const {
  upsertThrowdown,
  findFullThrowdown,
  upsertUser,
} = require('../db_actions')

module.exports = (payload, action, res) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id}
  } = payload

  const { _id, date } = JSON.parse(action.value)

  return upsertThrowdown(
    {_id},
    {$set: {start_date: new Date(date)}}
  )
    .then(throwdown => {
      return upsertUser(
        {user_id, team_id},
        {$push: {throwdowns: throwdown._id}}
      )
    })
    .then(user => {
      console.log('throwdown saved and user updated')
      return findFullThrowdown({_id})
    })
    .then(throwdown => {
      console.log('throwdown found')
      const message = {
        message_ts,
        channel_id,
        type: 'chat.update',
        text: `Awesome! Your Throwdown is all set up.`,
        attachments: [
          messageList.single_throwdown(throwdown, user_id)
        ]
      }
      return messageController(message, res)
    })
    .then(response => {
      console.log(response)
    })
    .catch(err => {
      console.log('error in set throwdown start date::' + err)
      return err
    })
}
