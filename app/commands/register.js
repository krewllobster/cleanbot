const { upsertUser } = require('../db_actions')
const messageList = require('../messages')
const dialogs = require('../dialogs')

module.exports = ({trigger_id}) => {
  return Promise.resolve({
    type: 'dialog.open',
    client: 'webClient',
    trigger_id,
    dialog: dialogs.registration(),
  })
}
