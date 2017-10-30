const { all_user_throwdowns } = require('../messages')
const multiMessageController = require('../controllers/multiMessageController')
const { loadingMessage } = require('../utils')

module.exports = async (body, res) => {
  const {name, team_id, user_name, user_id, channel_id} = body

  const processing = {
    client: res.botClient,
    user_id,
    text: 'Fetching your Throwdowns...'
  }

  const {channel, ts} = await loadingMessage(processing)

  const attachments = await all_user_throwdowns({team_id, user_id})

  const message = {
    type: 'chat.update',
    client: 'botClient',
    channel_id: channel,
    message_ts: ts,
    text: 'Your Throwdowns',
    attachments
  }

  if (attachments.length < 1) {
    message.text = `It looks like you haven't joined any Throwdowns yet!`
  }

  multiMessageController([message], res)
}
