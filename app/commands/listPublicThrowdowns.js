const { User, Throwdown } = require('../models')
const { all_public_throwdowns } = require('../messages')
const multiMessageController = require('../controllers/multiMessageController')

module.exports = async (body, res) => {
  const {name, team_id, user_name, user_id, channel_id} = body

  const processing = {
    type: 'chat.dm',
    client: 'botClient',
    user_id,
    text: 'Fetching public Throwdowns...'
  }

  const [{channel, ts}] = await multiMessageController([processing], res)

  const attachments = await all_public_throwdowns({team_id, user_id})

  const message = {
    type: 'chat.update',
    client: 'botClient',
    channel_id: channel,
    message_ts: ts,
    text: 'Public Throwdowns',
    attachments
  }

  if (attachments.length < 1) {
    message.text = `It looks like there aren't any public Throwdowns yet!`
  }

  multiMessageController([message], res)
}
