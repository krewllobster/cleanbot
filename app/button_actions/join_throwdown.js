const { User, Throwdown } = require('../models')
const { fundFullThrowdown, upsertThrowdown } = require('../db_actions')
const { all_public_throwdowns } = require('../messages')
const multiMessageController = require('../controllers/multiMessageController')

module.exports = ({
  message_ts,
  user_id,
  team_id,
  channel_id,
  throwdown_id,
  original_message,
}, res) => {

  User.findOne({user_id, team_id})
    .then(user => {
      return upsertThrowdown(
        {_id: throwdown_id},
        {$push: {participants: user._id}}
      )
    })
    .then(throwdown => {
      return all_public_throwdowns({user_id, team_id})
    })
    .then(attachments => {

      const repl_message = {
        type: 'chat.update',
        client: 'botClient',
        text: 'Public Throwdowns',
        message_ts,
        channel_id,
        attachments
      }

      return multiMessageController([repl_message], res)
    })
    .then(response => console.log(response))
    .catch(err => {
      console.log('error joining throwdown::' + err)
    })
}
