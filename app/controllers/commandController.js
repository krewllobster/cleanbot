const { initAuth } = require('../utils')
const commandList = require('../commands')
const messageController = require('./messageController')


module.exports = ({body}, res) => {

  let name = body.text.match(/new throwdown (.+)/)
  if (name) {
    body.text = 'new throwdown'
    body.name = name[1]
  }

  const commands = commandList()

  shortAuth(body, res)
    .then(messageSent => {
      console.log('message Sent: ' + messageSent)
      console.log('command controller reached')

      res.status(200).end()
      if (messageSent) return Promise.reject('Message already sent')

      if (commands.hasOwnProperty(body.text)) {
        return commands[body.text](body)
      } else {
        console.log('command unknown, returning default')
        return commands['unknown'](body)
      }
    })
    .then(message => {
      console.log('message to be sent')
      console.log(message)
      return messageController(message, res)
    })
    .then(response => {
      console.log(response)
    })
    .catch(err => {
      console.log('error in command controller::' + err)
      res.status(500).end()
    })
}

const shortAuth = (body, res) => {
  const noRegCommands = ['', 'help', 'register']

  return initAuth(body)
    .then(auth => {
      if (!auth) {
        res.status(500).end()
        return new Error('Token invalid')
      }
      console.log(auth)
      return auth
    })
    .then(({registered, opt_in}) => {
      if(registered) {
        if (opt_in || body.text === 'opt in') {
          return false
        } else {
          res.end(`You've opted out of /rumble notifications`)
          return true
        }
      } else {
        if (noRegCommands.includes(body.text)) {
          return false
        } else {
          res.end(`Look's like you havn't registered yet!`)
          return true
        }
      }
    })
    .catch(err => {
      console.log('error in init auth or command body parsing::' + err)
      res.status(500).end()
    })
}
