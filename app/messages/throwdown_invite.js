

module.exports = (throwdown) => {
  const participants = throwdown.participants.reduce((acc, p) => {
    return acc + `<@${p.user_id}> `
  }, '')

  const invitees = throwdown.invitees.reduce((acc, i) => {
    return acc + `<@${i.user_id}> `
  }, '')

  return [
    {
      title: 'Current participants:',
      text: participants,
      mrkdwn_in: ['text']
    },
    {
      title: 'Invited but not joined:',
      text: invitees,
      mrkdwn_in: ['text']
    },
    {
      text: 'Select a user',
      fallback: 'Invite a user to this throwdown',
      callback_id: 'send_invite',
      actions: [
        {
          name: throwdown._id,
          text: 'select a user',
          type: 'select',
          data_source: 'users'
        }
      ]
    }
  ]
}
