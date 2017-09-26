const { User, Throwdown } = require('../models')
const messageController = require('../controllers/messageController')

module.exports = ({
  message_ts,
  user_id,
  team_id,
  channel_id,
  throwdown_id
}, res) => {

  const user = User.findOneAndUpdate(
    {user_id, team_id},
    {$pull: {throwdowns: throwdown_id}}
  )

  const channel = User.findOne({user_id, team_id})
    .then(user => {
      return Throwdown.findOneAndUpdate(
        {_id: throwdown_id},
        {$pull: {participants: user._id}}
      )
    })
    .then(throwdown => throwdown.channel)
    .catch(err => err)

  Promise.all([user, channel])
    .then(([user, channel]) => {
      res.webClient.conversations.kick(channel.id, user.user_id)

      const repl_message = {
        type: 'chat.update',
        text: 'Throwdown left. You should no longer see the channel.',
        message_ts,
        channel_id,
        attachments: []
      }

      return messageController(repl_message, res)
    })
    .then(response => console.log(response))
    .catch(err => {
      console.log('error joining throwdown::' + err)
    })
}
