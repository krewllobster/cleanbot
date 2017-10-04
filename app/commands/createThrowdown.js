const { Category } = require('../models')

const messageList = require('../messages')
const dialogs = require('../dialogs')
const sendMessage = require('../controllers/multiMessageController')


module.exports = async (body, res) => {
  const {name, team_id, channel_id, user_name, user_id, trigger_id} = body

  const processing = {
    type: 'chat.dm',
    client: 'botClient',
    user_id,
    text: 'Processing new Throwdown...'
  }

  const [{channel, ts}] = await sendMessage([processing], res)

  const catList = await Category.find({})
    .then(categories => {
      return categories.map(c => {
        return {label: c.name, value: c._id}
      })
    })

  const delete_message = {
    type: 'chat.delete',
    client: 'botClient',
    message_ts: ts,
    channel_id: channel
  }

  const dialog = {
    type: 'dialog.open',
    client: 'botClient',
    trigger_id,
    dialog: dialogs.new_throwdown(catList)
  }

  sendMessage([dialog, delete_message], res)

}
