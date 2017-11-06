
module.exports = (deps, matchFields = {}) => {
  return new Promise(async (resolve, reject) => {
    const {slack, dbInterface, commandFactory, exec} = deps

    const findAllThrowdowns = commandFactory('db').setOperation('find')
      .setEntity('Throwdown').setMatch(matchFields)
      .setPopulate([
        {path: 'created_by', model: 'User'}, {path: 'participants', model: 'User'},
        {path: 'invitees', model: 'User'}, {path: 'categories', model: 'Category'}
      ]).save()

    console.log(findAllThrowdowns)
    const throwdownList = await exec.one(dbInterface, findAllThrowdowns)

    throwdownList.map(td => {
      if(td.invitees[0] === null) {
        td.invitees = []
      }
      return td
    })

    if(!throwdownList) {
      reject(new Error('throwdown not found'))
    } else {
      resolve(throwdownList)
    }
  })
}
