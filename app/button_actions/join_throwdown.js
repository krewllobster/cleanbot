const { User, Throwdown } = require('../models')
const { messageController } = require('../controllers')

module.exports = ({
  message_ts,
  user_id,
  team_id,
  channel_id,
  throwdown_id
}, res) => {

  const user = User.findOneAndUpdate(
    {user_id, team_id},
    {$push: {throwdowns: throwdown_id}}
  )

  const channel = Throwdown.findOne({_id: throwdown_id})

  const repl_message = {
    type: 'chat.update',
    text: 'Throwdown joined. You should see an invite!',
    channel_id,
    attachments: []
  }

  const replaceMessage = messageController(repl_message, res)

  Promise.all([user, channel, replaceMessage])
    .then(([user, channel, replaceMessage]) => {
      res.webClient.conversations.invite(channel.id, user.user_id)
    })
    .catch(err => {
      console.log('error joining throwdown::' + err)
    })
}
