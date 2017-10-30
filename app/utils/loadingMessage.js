module.exports = async ({user_id, channel, text, attachments, client}) => {
  if (channel) {
    return await client.chat.postMessage(channel, text, {attachments})
  }

  if(!channel) {
    const response = await client.conversations.open({users: user_id})
    return await client.chat.postMessage(response.channel.id, text, {attachments})
  }
}
