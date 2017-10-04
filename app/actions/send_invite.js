const multiMessageController = require('../controllers/multiMessageController')
const messages = require('../messages')
const { findOneUser, upsertThrowdown, findFullThrowdown } = require('../db_actions')

module.exports = (payload, action, res) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id}
  } = payload

  const throwdown_id = action.name
  console.log(action.selected_options)
  const user_to_invite = action.selected_options[0].value

  const user = findOneUser({user_id: user_to_invite, team_id})
  const throwdown = findFullThrowdown({_id: throwdown_id})

  Promise.all([user, throwdown])
    .then(([user, throwdown]) => {
      if (!user) {
        const register_message = {
          type: 'chat.dm',
          client: 'botClient',
          user_id: user_to_invite,
          text: `<@${throwdown.created_by.user_id}> would like to invite you to participate in a Throwdown!`,
          attachments: messages.register_to_join(throwdown, user_to_invite)
        }

        const not_registered = {
          type: 'chat.update',
          client: 'botClient',
          message_ts,
          channel_id,
          text: `<@${user_to_invite}> hasn't registered yet. They've received an invitation to register, so try back later, or send them a message.`,
          mrkdwn_in: ['text']
        }

        return Promise.reject(multiMessageController([register_message, not_registered], res))
      }

      const hasPart = throwdown.participants.map(p => p.user_id).includes(user_to_invite)
      const hasInvt = throwdown.participants.map(i => i.user_id).includes(user_to_invite)

      if (hasPart || hasInvt) {
        const err_message = {
          type: 'chat.update',
          client: 'botClient',
          message_ts,
          channel_id,
          text: `<@${user_to_invite}> has already joined or been invited!`,
          mrkdwn_in: ['text']
        }
        return Promise.reject(multiMessageController([err_message], res))
      }

      return upsertThrowdown(
        {_id: throwdown._id},
        {$push: {invitees: user._id}}
      )
    })
    .then(throwdown => {
      return findFullThrowdown({_id: throwdown._id})
    })
    .then(throwdown => {
      const invite_message = {
        type: 'chat.dm',
        client: 'botClient',
        text: `<@${throwdown.created_by.user_id}> has invited you to their new Throwdown: "${throwdown.name}"`,
        user_id: user_to_invite,
        attachments: [
          messages.accept_invite({throwdown_id, user_to_invite, owner: user_id, team_id})
        ],
        mrkdwn_in: ['text']
      }

      const invite_notification = {
        type: 'chat.update',
        client: 'botClient',
        text: `I've sent an invite to <@${user_to_invite}>`,
        channel_id,
        message_ts,
        attachments: messages.throwdown_invite(throwdown),
        mrkdwn_in: ['text']
      }

      return multiMessageController([invite_message, invite_notification], res)
    })
    .then(response => {
      console.log(response)
    })
    .catch(err => {
      console.log('error in sending invite::' + err)
    })

}
