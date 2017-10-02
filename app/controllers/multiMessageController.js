
module.exports = (messages, res) => {
  console.log('sending messages now')
  console.log('messages to send: ' + messages.length)
  let promises = []

  messages.forEach(m => {
    let {
      client,
      user_id,
      channel_id,
      type,
      text,
      attachments,
      message_ts,
      dialog,
      trigger_id,
    } = m

    console.log(m)

    switch (type) {
      case 'dialog.open':
        promises.push(
          res[client].dialog.open(dialog, trigger_id)
        )
        break
      case 'chat.dm':
        promises.push(
          res.botClient.conversations.open({users: user_id})
            .then((response) => {
              console.log(response)
              const {channel} = response
              res[client].chat.postMessage(channel.id, text, {attachments})
            })
        )
        break
      case 'chat.message':
        promises.push(res[client].chat.postMessage(channel_id, text, {attachments}))
        break
      case 'chat.ephemeral':
        promises.push(res[client].chat.postEphemeral(channel_id, text, user_id, {attachments}))
        break
      case 'chat.update':
        promises.push(res[client].chat.update(message_ts, channel_id, text, {as_user: true, attachments}))
        break
      default:
        return Promise.reject('message type not known')
    }
  })

  return Promise.all(promises)

}

const findChannel = (bot_id, user_id, client) => {
  return client.conversations.open({users: `bot_id, user_id`})
}
