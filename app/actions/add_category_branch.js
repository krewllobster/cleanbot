const { upsertThrowdown } = require('../db_actions')
const multiMessageController = require('../controllers/multiMessageController')
const messageList = require('../messages')

module.exports = (payload, action, res) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id}
  } = payload

  const { _id, add } = JSON.parse(action.value)

  return Promise.resolve(
    add ? messageList.add_category({_id}) : messageList.start_date_buttons({_id})
  )
    .then(attachment => {
      let message = {
        client: 'botClient',
        type: 'chat.update',
        message_ts,
        channel_id,
        attachments: [attachment]
      }

      return multiMessageController([message], res)
    })
    .then(response => console.log(response))
    .catch(err => {
      console.log('error in add category branch::' + err)
      return err
    })
}
