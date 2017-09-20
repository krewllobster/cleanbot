

module.exports = (message, res) => {
  const {
    team_id,
    user_id,
    channel_id,
    type,
    text,
    attachments,
    message_ts,
    replace_original = true
  } = message
  console.log(message)
  console.log('message type is: ' + type)
  switch (type) {
    case 'chat.message':
      return res.botClient.chat.postMessage(channel_id, text, {attachments})
      break
    case 'chat.ephemeral':
      return res.botClient.chat.postEphemeral(channel_id, text, user_id, {attachments})
      break
    case 'chat.update':
      return res.botClient.chat.update(message_ts, channel_id, text, {as_user: true, attachments})
      break
    default:
      return Promise.reject('message type not known')
  }
}
