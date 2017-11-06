

module.exports = (deps, {matchFields, updateFields}) => {
  return new Promise(async (resolve, reject) => {
    const {slack, dbInterface, commandFactory, exec} = deps

    const baseCommand = commandFactory('db').setOperation('findOne')
      .setEntity('Throwdown').setMatch(matchFields)
      .setPopulate([
        {path: 'created_by', model: 'User'}, {path: 'participants', model: 'User'},
        {path: 'invitees', model: 'User'}, {path: 'categories', model: 'Category'}
      ])

    let findFullThrowdown

    if(updateFields) {
      findFullThrowdown = baseCommand.setOperation('findOneAndUpdate')
        .setUpdate(updateFields).setOptions({new: true}).save()
    } else {
      findFullThrowdown = baseCommand.save()
    }

    const throwdown = await exec.one(dbInterface, findFullThrowdown)

    if(throwdown.invitees[0] === null) {
      throwdown.invitees = []
    }

    if(!throwdown) {
      reject(new Error('throwdown not found'))
    } else {
      resolve(throwdown)
    }
  })
}
