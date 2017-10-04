const messageList = require('../messages')
const multiMessageController = require('../controllers/multiMessageController')


module.exports = (body, res) => {
  console.log('unknown command: ' + body.text)

  const {name, team_id, user_name, user_id, channel_id} = body

  const message = {
    type: 'chat.dm',
    client: 'botClient',
    text: `I'm  not sure how to do "${body.text}" yet!`,
    user_id,
    attachments: [
      messageList.registration_complete()
    ]
  }

  multiMessageController([message], res)
    .then(responses => {
      console.log(responses)
    })
    .catch(err => {
      console.log(err)
    })
}
