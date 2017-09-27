

module.exports = (throwdown) => {
  return {
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
}
