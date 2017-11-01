const { to } = require('../utils')

const SlackApi = ({user_token, bot_token}) => {
  const WebClient = require('@slack/client').WebClient

  const clients = {
    userClient: new WebClient(user_token),
    botClient: new WebClient(bot_token)
  }

  const ops = (client) => ({
    openDm: ({users}) => client.conversations.open({users}),
    basicMessage: (command) => {
      const {channel, text, attachments} = command
      return client.chat.postMessage(channel, text, {attachments})
    },
    deleteMessage: ({ts, channel}) => {
      return client.chat.delete(ts, channel, {as_user: true})
    },
    openDialog: ({dialog, trigger}) => {
      return client.dialog.open(dialog, trigger)
    },
    userInfo: ({user}) => {
      return client.users.info(user)
    },
    updateMessage: ({channel, ts, text, attachments}) => {
      return client.chat.update(
        ts, channel, text, {as_user: true, attachments}
      )
    }
  })

  return {
    name: 'slackAPI interface',
    execute: (command) => {
      const client = clients[command.client]
      return ops(client)[command.operation](command)
    },
    executeMany: (commandList) => {
      let promises = []
      commandList.forEach(c => {
        const client = clients[c.client]
        promises.push(ops(client)[c.operation](c))
      })
      return Promise.all(promises)
    }
  }
}
// class SlackApi {
//   constructor({user_token, bot_token}) {
//     this.userClient = new WebClient(user_token)
//     this.botClient = new WebClient(bot_token)
//   }
//
//   async getUser({user_id}) {
//     let [err, user] = await to(this.botClient.users.info(user_id))
//     if(err) return this.errorHandle(err)
//     return user
//   }
//
//   async execute(command) {
//     console.log('executing command')
//     console.log(command)
//     const prom = this[command.operation](command)
//     console.log(prom)
//     let [err, response] = await to(prom)
//     console.log(err, response)
//     if(err) return this.errorHandle(err)
//     return response
//   }
//
//   async multiMessage(messageList) {
//     let [err, responses] = await to(Promise.all(
//       messageList.map((m) => this[m.type](m)))
//     )
//     if(err) return this.errorHandle(err)
//     return responses
//   }
//
//   openDm(command) {
//     console.log('opening dm')
//     console.log(command)
//     const {client, users} = command
//     return this[client].conversations.open({users})
//   }
//
//   basicMessage(command) {
//     const {client, channel_id, text, attachments} = command
//     return this[client].chat.postMessage(channel_id, text, {attachments})
//   }
//
//   updateMessage(command) {
//     const {client, message_ts, channel_id, text, attachments} = command
//     return this[client].chat.update(message_ts, channel_id, text, {as_user: true, attachments})
//   }
//
//   deleteMessage(command) {
//     const {client, message_ts, channel_id} = command
//     return this[client].chat.delete(message_ts, channel_id, {as_user: true})
//   }
//
//   errorHandle(err) {
//     console.log(err)
//     return new Error('error in SlackAPI class')
//   }
// }

module.exports = SlackApi
