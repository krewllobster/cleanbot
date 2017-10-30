const { Category } = require('../models')

const messageList = require('../messages')
const dialogs = require('../dialogs')

//move to utility function
const sendMessage = require('../controllers/multiMessageController')
const { loadingMessage, to } = require('../utils')
const dbInt = require('../domains/db')
const createCommand = require('../domains/commandFactory')


module.exports = async (body, res) => {
  const {name, team_id, channel_id, user_name, user_id, trigger_id} = body
  let err, response, categories

  const getChannel = createCommand('slack')
                      .setOperation('openDm')
                      .setUsers(user_id)
  console.log(getChannel)
  console.log(Object.keys(res.SlackApi))
  [err, response] = await to(res.SlackApi.execute(getChannel))
  const {channel} = response

  const sendProcessing  = createCommand('slack')
                            .setOperation('sendMessage')
                            .setText('Processing new Throwdown...')
                            .setChannel(channel.id)
  console.log(sendProcessing)
  [err, response] = await to(res.SlackApi.execute(sendProcessing))
  console.log('the response')
  console.log(response)
  const {ts} = response
  const getCategories = createCommand('db')
                          .setEntity('Category')
                          .setOperation('find')

  [err, categories] = await to(dbInt.execute(getCategories))
  if(err) {
    console.log(err)
    return err
  }
  const catList = categories.map(c => ({label: c.name, value: c._id}))
  // const catList = await Category.find({})
  //   .then(categories => {
  //     return categories.map(c => {
  //       return {label: c.name, value: c._id}
  //     })
  //   })
//value objects - primitive obsession

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
