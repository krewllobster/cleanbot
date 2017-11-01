const actions         = require('../actions')
const {initUser} = require('../common')

const {
  commandFactory,
  dbInterface,
  slackApi,
  exec
} = require('../domains')

module.exports = async (req, res) => {
  const payload = JSON.parse(req.body.payload)
  const {
    type, token, callback_id, submission,
    user: {id: userId}, team: {id: teamId},
  } = payload

  const errorHandle = (err) => {
    throw new Error('error in Command Controller::' + err)
  }
  const data = {token, team_id: teamId, user_id: userId}

  let domains = {dbInterface, commandFactory, exec, slackApi}

  deps = await initUser(data, res, domains).catch(errorHandle)

  if (type === 'interactive_message') {
    console.log(`calling action ${callback_id}`)
    if(actions.hasOwnProperty(callback_id)) {
      const action = payload.actions[0]
      actions[callback_id](payload, action, res)
    } else {
      throw new Error('Action does not exist')
    }
  }

  if (type === 'dialog_submission') {
    console.log(`handling dialog ${callback_id}`)
    actions[callback_id](payload, submission, deps)
  }
}
