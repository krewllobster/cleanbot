const { upsertUser } = require('../db_actions')
const messageList = require('../messages')
const sendMessage = require('../controllers/multiMessageController')

module.exports = async (payload, submission, res) => {
  const {team: {id: team_id}, user: {id: user_id}} = payload

  const user = await upsertUser(
    {team_id, user_id},
    {$set: {
      profile: submission
    }}
  )

  const message = {
    type: 'chat.dm',
    client: 'botClient',
    user_id,
    text: 'Thanks for filling out our registration -- here is what you can do next!',
    attachments: [
      messageList.registration_complete()
    ]
  }

  sendMessage([message], res)
}
