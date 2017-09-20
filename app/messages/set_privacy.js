

module.exports = ({_id}) => {
  return {
    title: 'Who should be able to join this throwdown?',
    fallback: 'Throwdown setup',
    callback_id: 'set_throwdown_privacy',
    actions: [
      {
        name: 'set_throwdown_privacy',
        text: 'Anyone can join',
        value: JSON.stringify({_id, privacy: 'public'}),
        type: 'button'
      },
      {
        name: 'set_throwdown_privacy',
        text: 'Only people I invite',
        value: JSON.stringify({_id, privacy: 'private'}),
        type: 'button',
      }
    ]
  }
}
