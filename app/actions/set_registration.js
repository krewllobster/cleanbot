const { upsertUser } = require('../db_actions')
const messageList = require('../messages')
const sendMessage = require('../controllers/multiMessageController')

module.exports = (payload, submission, res) => {
  const {team: {id: team_id}, user: {id: user_id}} = payload

  console.log(payload)
  console.log(submission)

  upsertUser(
    {team_id, user_id},
    {$set: {
      profile: submission
    }}
  )
  .then(user => {
    const message = {
      type: 'chat.dm',
      client: 'botClient',
      user_id,
      text: 'Thanks for filling out our registration -- here is what you can do next!',
      attachments: [
        messageList.registration_complete()
      ]
    }

    return sendMessage([message], res)
  })
  .then(response => {
    console.log(response)
  })
  .catch(err => {
    console.log('error registering user::' + err)
    return err
  })
}
