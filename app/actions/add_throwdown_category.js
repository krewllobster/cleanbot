const { upsertThrowdown } = require('../db_actions')
const messageController = require('../controllers/messageController')
const messageList = require('../messages')

module.exports = (payload, action, res) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id}
  } = payload
  const { _id, category } = JSON.parse(action.selected_options[0].value)

  return upsertThrowdown(
    {_id},
    {'$push': {categories: category._id}}
  )
  .then(throwdown => {
    const message = {
      text: `Category added: ${category.name}`,
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
    console.log('category add message replaced')
    const message = {
      user_id,
      team_id,
      channel_id,
      type: 'chat.message',
      attachments: [
        messageList.add_another_category({_id})
      ]
    }
    return message
  })
  .then(message => {
    return messageController(message, res)
  })
  .then(response => {
    console.log('sent add another category question')
  })
  .catch(err => {
    console.log('error in add throwdown category action::'+ err)
    return err
  })
}
