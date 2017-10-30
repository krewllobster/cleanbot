const WebClient = require('@slack/client').WebClient
const { to } = require('../utils')


class SlackApi {
  constructor({user_token, bot_token}) {
    this.userClient = new WebClient(user_token)
    this.botClient = new WebClient(bot_token)
  }

  async getUser({user_id}) {
    let [err, user] = await to(this.botClient.users.info(user_id))
    if(err) return this.errorHandle(err)
    return user
  }

  async execute(command) {
    console.log('executing command')
    console.log(command)
    const prom = this[command.operation](command)
    console.log(prom)
    let [err, response] = await to(prom)
    console.log(err, response)
    if(err) return this.errorHandle(err)
    return response
  }

  async multiMessage(messageList) {
    let [err, responses] = await to(Promise.all(
      messageList.map((m) => this[m.type](m)))
    )
    if(err) return this.errorHandle(err)
    return responses
  }

  openDm(command) {
    console.log('opening dm')
    console.log(command)
    const {client, users} = command
    return this[client].conversations.open({users})
  }

  basicMessage(command) {
    const {client, channel_id, text, attachments} = command
    return this[client].chat.postMessage(channel_id, text, {attachments})
  }

  updateMessage(command) {
    const {client, message_ts, channel_id, text, attachments} = command
    return this[client].chat.update(message_ts, channel_id, text, {as_user: true, attachments})
  }

  deleteMessage(command) {
    const {client, message_ts, channel_id} = command
    return this[client].chat.delete(message_ts, channel_id, {as_user: true})
  }

  errorHandle(err) {
    console.log(err)
    return new Error('error in SlackAPI class')
  }
}

module.exports = SlackApi
