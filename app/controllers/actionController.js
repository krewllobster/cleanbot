const { verifyToken } = require('../utils')
const actions         = require('../actions')

//modify to check type to split flow on 'interactive_message' vs 'dialog_submission'

module.exports = (req, res) => {
  const payload = JSON.parse(req.body.payload)
  const { type, token, callback_id } = payload

  verifyToken(token)
    .then(() => {
      //token verified, send completed 200 to tell Slack action received
      res.status(200).end()

      //interactive_message is response from button or dropdown
      if (type === 'interactive_message') {
        console.log(`calling action ${callback_id}`)
        if(actions.hasOwnProperty(callback_id)) {
          const action = payload.actions[0]
          actions[callback_id](payload, action, res)
        } else {
          return new Error('Action does not exist')
        }
      }

      //dialog_submission is response from dialog
      if (type === 'dialog_submission') {
        console.log(`handling dialog ${callback_id}`)
        const submission = payload.submission
        
        actions[callback_id](payload, submission, res)
      }
    })
    .catch(err => {
      console.log('error in action controller::' + err)
      res.status(500).end()
    })

}
