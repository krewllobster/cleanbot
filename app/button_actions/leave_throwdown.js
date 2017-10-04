const { User, Throwdown } = require('../models')
const { upsertThrowdown } = require('../db_actions')
const { multiMessageController } = require('../controllers')

module.exports = ({
  message_ts,
  user_id,
  team_id,
  channel_id,
  throwdown_id
}, res) => {

  User.findOne({user_id, team_id})
    .then(user => upsertThrowdown({_id: throwdown_id}, {$pull: {participants: user._id}}))
    .then(throwdown => {

      const repl_message = {
        type: 'chat.update',
        text: 'Throwdown left. You should no longer see the channel.',
        message_ts,
        channel_id,
        attachments: []
      }

      return multiMessageController([repl_message], res)
    })
    .then(response => console.log(response))
    .catch(err => {
      console.log('error joining throwdown::' + err)
    })
}
