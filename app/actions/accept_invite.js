const multiMessageController = require('../controllers/multiMessageController')
const messages = require('../messages')
const { findFullThrowdown, upsertThrowdown, findOneUser } = require('../db_actions')

module.exports = (payload, action, res) => {
  console.log(action)
  if (action.name === 'accept_invite') {
    accept(payload, action, res)
  }

  if (action.name === 'reject_invite') {
    reject(payload, action, res)
  }
}

const accept = (payload, action, res) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id},
    original_message,
  } = payload

  const { throwdown_id, user_to_invite, owner } = JSON.parse(action.value)

  findOneUser({user_id: user_to_invite, team_id})
    .then(user => {
      console.log(user)
      return upsertThrowdown(
        {_id: throwdown_id},
        {
          $push: {participants: user._id},
          $pull: {invitees: user._id},
        }
      )
    })
    .then(throwdown => {
      console.log(throwdown)
      return findFullThrowdown({_id: throwdown._id})
    })
    .then(throwdown => {
      const congrats_message = {
        type: 'chat.update',
        client: 'botClient',
        message_ts,
        channel_id,
        text: `Sweet! You'll get a notification when "${throwdown.name}" starts.`,
        attachments: [
          messages.single_throwdown(throwdown, user_to_invite)
        ]
      }

      const accept_notification = {
        type: 'chat.dm',
        client: 'botClient',
        user_id: owner,
        text: `<@${user_to_invite}> has accepted your invitation to Throwdown: "${throwdown.name}"`
      }

      return multiMessageController([congrats_message, accept_notification], res)
    })
    .then(response => console.log(response))
    .catch(err => {
      console.log('error sending accept notification::' + err)
    })
}

const reject = (payload, action, res) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id},
    original_message,
  } = payload

  const { throwdown_id, user_to_invite, owner } = JSON.parse(action.value)

  findOneUser({user_id: user_to_invite, team_id})
    .then(user => {
      console.log(user)
      return upsertThrowdown(
        {_id: throwdown_id},
        {
          $pull: {invitees: user._id},
        }
      )
    })
    .then(throwdown => {
      console.log(throwdown)
      return findFullThrowdown({_id: throwdown._id})
    })
    .then(throwdown => {
      const reject_message = {
        type: 'chat.update',
        client: 'botClient',
        message_ts,
        channel_id,
        text: `Ok, no problem. To receive another invite, send a message to <@${owner}>`,
        attachments: [],
        mrkdwn_in: ['text']
      }

      const reject_notification = {
        type: 'chat.dm',
        client: 'botClient',
        user_id: owner,
        text: `<@${user_to_invite}> has rejected your invitation to Throwdown: "${throwdown.name}"`
      }

      return multiMessageController([reject_message, reject_notification], res)
    })
    .then(response => console.log(response))
    .catch(err => {
      console.log('error sending accept notification::' + err)
    })
}
