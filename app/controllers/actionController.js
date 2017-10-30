const { verToken, checkUser } = require('../utils')
const actions         = require('../actions')
const commands = require('../commands')

module.exports = async (req, res) => {
  const payload = JSON.parse(req.body.payload)
  console.log(payload)
  const {
    type,
    token,
    callback_id,
    user: {id: user_id},
    team: {id: team_id}
  } = payload

  const verified = verToken(token)

  if(!verified) {
    throw new Error('token does not match, invalid request')
  }

  //end with 200 here to let slack client know command received
  res.status(200).end()

  const user = await checkUser({user_id, team_id}, res.botClient)

  if(!user) {
    throw new Error('user not found or not created')
  }

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
}
//
// module.exports = (req, res) => {
//   const payload = JSON.parse(req.body.payload)
//   const { type, token, callback_id } = payload
//
//   verifyToken(token)
//     .then(() => {
//       //token verified, send completed 200 to tell Slack action received
//       res.status(200).end()
//
//       //interactive_message is response from button or dropdown
//       if (type === 'interactive_message') {
//         console.log(`calling action ${callback_id}`)
//         if(actions.hasOwnProperty(callback_id)) {
//           const action = payload.actions[0]
//           actions[callback_id](payload, action, res)
//         } else {
//           return new Error('Action does not exist')
//         }
//       }
//
//       //dialog_submission is response from dialog
//       if (type === 'dialog_submission') {
//         console.log(`handling dialog ${callback_id}`)
//         const submission = payload.submission
//
//         actions[callback_id](payload, submission, res)
//       }
//     })
//     .catch(err => {
//       console.log('error in action controller::' + err)
//       res.status(500).end()
//     })
//
// }
