const { upsertUser } = require('../db_actions')
const messageList = require('../messages')

module.exports = (body) => {
  return Promise.resolve(
    {
      team_id: body.team_id,
      channel_id: body.channel_id,
      user_id: body.user_id,
      type: 'chat.message',
      text: `Please answer a few questions to complete registration!`,
      attachments: [
        messageList['reg_question_1'](body)
      ]
    }
  )
}
