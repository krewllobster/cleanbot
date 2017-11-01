const exec = () => {
  const one = (domain, command) => {
    console.log(`executing "${command.operation}${command.entity ? ' ' + command.entity : ''}" through "${domain.name}"`)
    return domain.execute(command)
  }

  const many = (instructions) => {
    let promiseList = instructions.map(([domain, command]) => {
      return one(domain, command)
    })
    return Promise.all(promiseList)
  }

  return {
    one,
    many
  }
}

module.exports = exec()
