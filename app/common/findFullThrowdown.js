

module.exports = async (deps, {matchFields, updateFields}) => {
  const {slack, dbInterface, commandFactory, exec} = deps
  console.log(matchFields)
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
  console.log(findFullThrowdown)
  return await exec.one(dbInterface, findFullThrowdown)
}
