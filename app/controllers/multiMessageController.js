
module.exports = (messages, res) => {
  console.log('sending messages now')
  console.log('messages to send: ' + messages.length)
  console.log(messages)
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
          res[client].dialog.open(dialog, trigger_id).then(response => response)
        )
        break
      case 'chat.dm':
        promises.push(
          res.botClient.conversations.open({users: user_id})
            .then(response => {
              const {channel} = response
              return res[client].chat.postMessage(channel.id, text, {attachments})
            })
        )
        break
      case 'chat.message':
        promises.push(
          res[client].chat.postMessage(channel_id, text, {attachments})
            .then(response => response)
        )
        break
      case 'chat.ephemeral':
        promises.push(
          res[client].chat.postEphemeral(channel_id, text, user_id, {attachments})
            .then(response => response)
        )
        break
      case 'chat.update':
        promises.push(
          res[client].chat.update(message_ts, channel_id, text, {as_user: true, attachments})
            .then(response => response)
        )
        break
      case 'chat.delete':
        promises.push(
          res[client].chat.delete(message_ts, channel_id, {as_user: true})
            .then(response => response)
        )
        break
      default:
        return Promise.reject('message type not known')
    }
  })

  return Promise.all(promises)
    .then(responses => {
      console.log('responses')
      console.log(responses)
      return responses
    })
    .catch(errors => {
      console.log(errors)
    })

}

const findChannel = (bot_id, user_id, client) => {
  return client.conversations.open({users: `bot_id, user_id`})
}
