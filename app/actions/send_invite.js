const multiMessageController = require('../controllers/multiMessageController')
const messages = require('../messages')
const { findOneUser, upsertThrowdown, findFullThrowdown } = require('../db_actions')
const { checkUser, to } = require('../utils')

module.exports = async (payload, action, res) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id}
  } = payload

  const throwdown_id = action.name
  const user_to_invite = await checkUser({
    user_id: action.selected_options[0].value,
    team_id
  }, res.botClient)

  let throwdown = await findFullThrowdown({_id: throwdown_id})


  let messageList = []

  if (!throwdown) {
    const no_td_message = {
      type: 'chat.update',
      client: 'botClient',
      message_ts,
      channel_id,
      text: `It looks like this Throwdown no longer exists, sorry!`,
      attachments: []
    }

    messageList.push(no_td_message)
  }

  if (throwdown) {
    const hasPart = throwdown.participants.map(p => p.user_id).includes(user_to_invite.user_id)
    const hasInvt = throwdown.invitees.map(i => i.user_id).includes(user_to_invite.user_id)

    if (user_to_invite && (hasPart || hasInvt)) {
      const err_message = {
        type: 'chat.update',
        client: 'botClient',
        message_ts,
        channel_id,
        text: `<@${user_to_invite.user_id}> has already ${hasPart ? 'joined' : 'been invited'}!`,
        attachments: messages.throwdown_invite(throwdown),
        mrkdwn_in: ['text']
      }
      messageList.push(err_message)

    } else if (user_to_invite && !hasPart && !hasInvt) {
      const newThrowdown = await upsertThrowdown(
        {_id: throwdown._id},
        {$push: {invitees: user_to_invite._id}}
      )

      const newFullThrowdown = await findFullThrowdown({_id: newThrowdown._id})

      console.log(newFullThrowdown)

      const invite_message = {
        type: 'chat.dm',
        client: 'botClient',
        text: `<@${newFullThrowdown.created_by.user_id}> has invited you to their new Throwdown: "${newFullThrowdown.name}"`,
        user_id: user_to_invite.user_id,
        attachments: [
          messages.accept_invite({throwdown_id, user_to_invite: user_to_invite.user_id, owner: user_id, team_id})
        ],
        mrkdwn_in: ['text']
      }

      const invite_notification = {
        type: 'chat.update',
        client: 'botClient',
        text: `I've sent an invite to <@${user_to_invite.user_id}>`,
        channel_id,
        message_ts,
        attachments: messages.throwdown_invite(newFullThrowdown),
        mrkdwn_in: ['text']
      }

      messageList.push(invite_message, invite_notification)
    }
  }




  multiMessageController(messageList, res)
}
