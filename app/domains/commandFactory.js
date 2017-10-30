const createCommand = (type) => {
  const command = {}
  let methods
  switch(type) {
    case 'slack':
      methods = ['Operation', 'Users', 'User', 'Channel', 'Text', 'Attachments']
      break
    case 'db':
      methods = ['Entity', 'Operation', 'Match', 'Update', 'Options']
      break
    default:
      throw new Error('command type not specified')
  }

  const titleCase = (string) => string.charAt(0).toUpperCase() + string.slice(1)
  const set = (base, add) => Object.assign(base, add)

  methods.forEach(m => {
    command['set' + m] = (value) => {
      command[m.toLowerCase()] = value
      return command
    }
    command['get' + m] = () => {
      return command[m]
    }
  })
  return command
}

module.exports = createCommand
