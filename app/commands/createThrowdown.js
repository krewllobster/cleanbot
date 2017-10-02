const { Category } = require('../models')

const messageList = require('../messages')
const dialogs = require('../dialogs')

module.exports = (body) => {
  const {name, team_id, user_name, user_id, trigger_id} = body

  //error handle for command body
  if (!team_id || !user_name || !user_id) {
    return Promise.reject(new Error('missing required field in body'))
  }

  return Category.find({})
    .then(categories => {
      let catList = categories.map(c => {
        return {label: c.name, value: c._id}
      })

      return {
        type: 'dialog.open',
        client: 'botClient',
        trigger_id,
        dialog: dialogs.new_throwdown(catList)
      }
    })
    .catch(err => {
      console.log('error in create throwdown command::' + err)
      return err
    })

}

//premade messages


const set_privacy = ({name, team_id, channel_id, user_id}, _id) => ({
  team_id,
  channel_id,
  user_id,
  client: 'botClient',
  type: 'chat.dm',
  attachments: [
    messageList.set_privacy({_id})
  ]
})

const name_too_long = ({team_id, channel_id, user_id}) => ({
  team_id,
  channel_id,
  user_id,
  client: 'botClient',
  type: 'chat.dm',
  text: `Unfortunately, names must be 24 characters or fewer. Try again!`,
  attachments: []
})

const name_taken = ({team_id, channel_id, user_id}) => ({
  team_id,
  channel_id,
  user_id,
  client: 'botClient',
  type: 'chat.dm',
  text: `Look's like that name has been taken, sorry!`,
  attachments: []
})

const noNameResponse = ({team_id, channel_id, user_id}) => ({
  team_id,
  channel_id,
  user_id,
  client: 'botClient',
  type: 'chat.dm',
  text: `You forgot to add a name after "new throwdown"!`,
  attachments: []
})
