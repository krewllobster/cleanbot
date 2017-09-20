const {
  findOrCreateThrowdown
} = require('../db_actions')

const messageList = require('../messages')

module.exports = (body) => {
  const {name, team_id, user_name, user_id} = body

  //error handle for command body
  if (!team_id || !user_name || !user_id) {
    return Promise.reject(new Error('missing required field in body'))
  }

  //error handle for potential user mistake
  if (!name || name.trim() === '') {
    return Promise.resolve(noNameResponse(body))
  }

  return findOrCreateThrowdown(body)
    .then(({created, doc}) => {
      if(created) {
        return set_privacy(body, doc._id)
      } else {
        return name_taken(body)
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
  type: 'chat.message',
  attachments: [
    messageList.set_privacy({_id})
  ]
})
const name_taken = ({team_id, channel_id, user_id}) => ({
  team_id,
  channel_id,
  user_id,
  type: 'chat.ephemeral',
  text: `Look's like that name has been taken, sorry!`,
  attachments: []
})

const noNameResponse = ({team_id, channel_id, user_id}) => ({
  team_id,
  channel_id,
  user_id,
  type: 'chat.ephemeral',
  text: `You forgot to add a name after "new throwdown"!`,
  attachments: []
})
