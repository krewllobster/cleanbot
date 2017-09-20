const { verifyToken } = require('../utils')
const actions         = require('../actions')

module.exports = (req, res) => {
  const payload = JSON.parse(req.body.payload)
  const action = payload.actions[0]
  const {token, callback_id} = payload

  const actionList = actions(req, res)

  verifyToken(token)
    .then(() => {
      res.status(200).end()
    })
    .then(() => {
      console.log('calling action: ' + callback_id)
      if(actionList.hasOwnProperty(callback_id)) {
        console.log('found action, calling now...')
        actionList[callback_id]()
      } else {
        return new Error('Action does not exist')
      }
    })
    .catch(err => {
      console.log('error in action controller::' + err)
      res.status(500).end()
    })
}
