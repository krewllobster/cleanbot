const messageController = require('../controllers/messageController')
const messageList = require('../messages')
const {
  deleteThrowdown,
  findFullThrowdown
} = require('../db_actions')

module.exports = ({
  user_id,
  team_id,
  channel_id,
  throwdown_id
}, res) => {
  let throwdownToDelete

  findFullThrowdown({_id: throwdown_id})
    .then(throwdown => {
      throwdownToDelete = throwdown
      return deleteThrowdown({_id: throwdown_id})
    })
    .then(() => {
      let messagePromises = []
      throwdownToDelete.participants.forEach(p => {
        const message = {
          user_id: p.user_id,
          team_id,
          channel_id,
          type: 'chat.ephemeral',
          attachments: [
            messageList.throwdown_deleted(throwdownToDelete)
          ]
        }
        if (p.opt_in) messagePromises.push(messageController(message, res))
      })
      return Promise.all(messagePromises)
    })
    .then(results => {
      console.log('messages sent to participants')
      console.log(results)
    })
    .catch(err => {
      console.log('error deleting throwdown and sending messages to participants::' + err)
    })
}
