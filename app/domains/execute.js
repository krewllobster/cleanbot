const execute = (domain, command) => {
  console.log(`executing "${command.operation}${command.entity ? ' ' + command.entity : ''}" through "${domain.name}"`)
  if(Array.isArray(command)) {
    return domain.executeMany(command)
  }
  return domain.execute(command)
}

module.exports = execute
