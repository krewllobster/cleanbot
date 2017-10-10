const { User, Throwdown } = require('../models')
const { fundFullThrowdown, upsertThrowdown } = require('../db_actions')
const { all_public_throwdowns, all_user_throwdowns} = require('../messages')
const multiMessageController = require('../controllers/multiMessageController')

module.exports = async ({
  message_ts,
  user_id,
  team_id,
  channel_id,
  throwdown_id,
  public,
}, res) => {

  const user = await User.findOne({user_id, team_id})
  const throwdown = await Throwdown.find({_id: throwdown_id})

  const updatedThrowdown = await upsertThrowdown(
    {_id: throwdown._id},
    {$push: {participants: user._id}}
  )

  const confirm_message = {
    type: 'chat.update',
    client: 'botClient',
    message_ts,
    channel_id,
  }

  if (public && user && throwdown) {
    confirm_message.attachments = await all_public_throwdowns({user_id, team_id})
    confirm_message.text = `You joined Throwdown "${throwdown.name}"\nPublic Throwdowns:`
  } else if (!public && user && throwdown) {
    confirm_message.attachments = await all_user_throwdowns({user_id, team_id})
    confirm_message.text = `You joined Throwdown "${throwdown.name}"\nYour Throwdowns:`
  } else if (!user || !throwdown) {
    confirm_message.text = `Something has changed since this message was sent. Please refresh with a new "/rumble" command.`
  }

  multiMessageController([confirm_message], res)
}
