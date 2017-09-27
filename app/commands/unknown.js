const messageList = require('../messages')

module.exports = (body) => {
  console.log(body)
  return {
    team_id: body.team_id,
    channel_id: body.channel_id,
    user_id: body.user_id,
    type: 'chat.ephemeral',
    client: 'botClient',
    text: `I don't know how to do that yet`,
    attachments: [
      messageList.registration_complete()
    ]
  }
}
