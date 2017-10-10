const { User, Throwdown } = require('../models')
const { upsertThrowdown } = require('../db_actions')
const multiMessageController = require('../controllers/multiMessageController')
const { all_public_throwdowns, all_user_throwdowns} = require('../messages')

module.exports = async ({
  message_ts,
  user_id,
  team_id,
  channel_id,
  throwdown_id,
  public
}, res) => {

  const user =  await User.findOne({user_id, team_id})
  const throwdown = await upsertThrowdown(
    {_id: throwdown_id},
    {$pull: {participants: user._id}}
  )

  const confirm_message = {
    type: 'chat.update',
    client: 'botClient',
    message_ts,
    channel_id
  }

  if (public && user && throwdown) {
    confirm_message.attachments = await all_public_throwdowns({user_id, team_id})
    confirm_message.text = `You have left Throwdown "${throwdown.name}"\nPublic Throwdowns:`
  } else if (!public && user && throwdown) {
    confirm_message.attachments = await all_user_throwdowns({user_id, team_id})
    confirm_message.text = `You have left Throwdown "${throwdown.name}"`
    if (confirm_message.attachments.length < 1) {
      confirm_message.text += `\nLook's like you are not participating in any Throwdowns`
    } else {
      confirm_message.text += `\nYour Throwdowns:`
    }
  } else if (!user || !throwdown) {
    confirm_message.text = `Something has changed since this message was sent. Please refresh with a new "/rumble" command.`
  }

  multiMessageController([confirm_message], res)
  //need logic here to update channel if they've left after throwdown starts

}
