const messageController = require('../controllers/messageController')
const messageList = require('../messages')
const {
  upsertThrowdown,
  findFullThrowdown,
  upsertUser,
} = require('../db_actions')
const { createPublicChannel } = require('../utils')
const moment = require('moment')



module.exports = (payload, action, res) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id}
  } = payload

  const { _id, date } = JSON.parse(action.value)

  return upsertThrowdown(
    {_id},
    {$set: {start_date: new Date(date)}}
  )
    .then(throwdown => {
      console.log('setting privacy*****************')
      return createPublicChannel(res.webClient, team_id, throwdown.name, user_id)
        .then(channel => {
          console.log('channel created++++++++')
          console.log(channel)
          return upsertThrowdown({_id: throwdown._id}, {channel: {id: channel.id, name: channel.name}})
        })
        .then(throwdown => {
          return throwdown
        })
        .catch(err => {
          return err
        })
    })
    .then(throwdown => {
      return upsertUser(
        {user_id, team_id},
        {$push: {throwdowns: throwdown._id}}
      )
    })
    .then(user => {
      console.log('throwdown saved and user updated')
      return findFullThrowdown({_id})
    })
    .then(throwdown => {
      console.log('throwdown found')
      console.log(throwdown)
      const completed_message = {
        message_ts,
        channel_id,
        type: 'chat.update',
        text: `Awesome! Your Throwdown is all set up.`,
        attachments: [
          messageList.single_throwdown(throwdown, user_id)
        ]
      }

      const public_message = {
        type: 'chat.message',
        channel_id: throwdown.channel.id,
        text: `Welcome to throwdown "${throwdown.name}"!\nOn ${moment(throwdown.start_date).format('ddd, MMM Do')} I'll ask the first question!`,
        attachments: []
      }

      const completed = messageController(completed_message, res)
      const public = messageController(public_message, res)

      return Promise.all([completed, public])
    })
    .then(response => {
      console.log(response)
    })
    .catch(err => {
      console.log('error in set throwdown start date::' + err)
      return err
    })
}
