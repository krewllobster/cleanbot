const { upsertThrowdown, findFullThrowdown } = require('../db_actions')
const { User, Throwdown } = require('../models')
const messageList = require('../messages')
const sendMessage = require('../controllers/multiMessageController')

module.exports = (payload, submission, res) => {

  console.log(payload)

  const {
    team: {id: team_id},
    user: {id: user_id},
    channel: {id: channel_id},
  } = payload

  const {
    name, description, category, privacy, start_date
  } = submission


  const user = User.findOne({team_id, user_id})
  const throwdown = Throwdown.findOne({team_id, name})

  Throwdown.findOne({team_id, name})
    .then(throwdown => {
      if (throwdown) {
        return Promise.reject(sendMessage([{
          type: 'chat.dm',
          client: 'botClient',
          text: `It looks like that name's been taken. Please try again!`,
          user_id,
        }], res))
      }

      return User.findOne({team_id, user_id})
    })
    .then(user => {
      console.log(user)
      return upsertThrowdown(
        {team_id, name},
        {
          $set: {
            privacy,
            name,
            created_by: user._id,
            description,
            start_date: new Date(start_date)
          },
          $push: {participants: user._id, categories: category},
        }
      )
    })
    .then(throwdown => {
      console.log(throwdown)
      return findFullThrowdown({_id: throwdown._id})
    })
    .then(throwdown => {
      const message = {
        type: 'chat.dm',
        client: 'botClient',
        text: 'Congratulations, your Throwdown is now set up!',
        user_id,
        attachments: [
          messageList.single_throwdown(throwdown, user_id)
        ]
      }

      if (throwdown.privacy === 'private') {
        message.text += `\nYou can invite people using the button below.`
      } else if (throwdown.privacy === 'public') {
        message.text += `\nYour throwdown now shows up for anyone to join.`
      }

      return sendMessage([message], res)
    })
    .then(response => {
      console.log(response)
    })
    .catch(err => {
      console.log('error creating throwdown::' + err)
      return err
    })

}
