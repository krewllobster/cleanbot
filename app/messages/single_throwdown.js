const moment = require('moment')

module.exports = ({throwdown, user_id, public}) => {

  const buttonList = buttons({throwdown_id: throwdown._id, public})

  const started = moment().isSameOrAfter(throwdown.start_date, 'day')
  const private = throwdown.privacy === 'private'
  const isOwner = throwdown.created_by.user_id === user_id
  const canJoin = !throwdown.participants.some(p => p.user_id === user_id)

  let actions = []

  if (isOwner && private)   actions.push(buttonList.invite)
  if (isOwner && !canJoin)  actions.push(buttonList.delete)
  if (!isOwner && canJoin)  actions.push(buttonList.join)
  if (!isOwner && !canJoin) actions.push(buttonList.leave)

  return {
    title: throwdown.name,
    callback_id: 'throwdown_action',
    fields: [
      {
        title: 'Question Categories:',
        value: `${
          throwdown.categories.reduce(
            (accumulator, category, index) => {
              return accumulator + `${index+1}. ${category.name}\n`
            },
            ''
          )
        }`
      },
      {
        title: 'Participants:',
        value: `${
          throwdown.participants.reduce(
            (accumulator, participant) => {
              return accumulator + `<@${participant.user_id}|${participant.user_name}>`
            },
            ''
          )
        }`
      },
      {
        title: 'Created By:',
        value: `<@${throwdown.created_by.user_id}|${throwdown.created_by.user_name}>`,
        short: true
      },
      {
        title: `${started ? 'Throwdown Started:' : 'Throwdown Starts:'}`,
        value: `${moment(throwdown.start_date).format('MMM Do, YYYY')}`,
        short: true
      }
    ],
  actions,
  "mrkdwn_in": [
        "text",
        "pretext"
    ],
  }
}

const buttons = ({throwdown_id, public}) => {
  const val = (command) => JSON.stringify({
    throwdown_id,
    command,
    public,
  })

  return {
    join: {
      text: 'Join Throwdown',
      name: 'join_throwdown',
      value: val('join_throwdown'),
      type: 'button',
      style: 'primary'
    },
    leave: {
      text: 'Leave Throwdown',
      name: 'leave_throwdown',
      value: val('leave_throwdown'),
      type: 'button',
      style: 'danger',
      confirm: {
        title: 'Are you sure?',
        text: 'If this throwdown has started, you will not be able to rejoin!',
        ok_text: 'Yes, leave this Throwdown',
        dismiss_text: 'No, stay in this Throwdown',
      }
    },
    delete: {
      text: 'Delete Throwdown',
      name: 'delete_throwdown',
      value: val('delete_throwdown'),
      type: 'button',
      style: 'danger',
      confirm: {
        title: 'Are you sure?',
        text: 'Deleting this Throwdown cannot be undone',
        ok_text: 'Yes, delete this Throwdown',
        dismiss_text: 'No, keep this Throwdown',
      },
    },
    invite: {
      text: 'Send Invites',
      name: 'send_invite_list',
      value: val('send_invite_list'),
      type: 'button',
      style: 'primary',
    }
  }
}
