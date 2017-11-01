const createCommand = (type) => {
  const command = {
    client: 'botClient'
  }

  const methodObject = {}

  let methods
  switch(type) {
    case 'slack':
      methods = ['Operation', 'Client', 'Dialog', 'Trigger', 'Users',
                 'Ts', 'User', 'Channel', 'Text', 'Attachments']
      break
    case 'db':
      methods = ['Entity', 'Operation', 'Match', 'Update', 'Options', 'Populate']
      break
    default:
      throw new Error('command type not specified')
  }

  methods.forEach(m => {
    methodObject['set' + m] = (value) => {
      command[m.toLowerCase()] = value
      return methodObject
    }
    methodObject['get' + m] = () => {
      return command[m]
    }
  })
  methodObject.save = () => Object.assign({}, command)
  return methodObject
}

module.exports = createCommand