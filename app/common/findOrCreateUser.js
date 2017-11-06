

module.exports = async (deps, data) => {
  const {slack, dbInterface, commandFactory, exec} = deps
  const {user_id, team_id} = data

  return new Promise(async (resolve, reject) => {
    const findUser = commandFactory('db').setOperation('findOne')
      .setEntity('User').setMatch({team_id, user_id}).save()

    const user = await exec.one(dbInterface, findUser)
    console.log('finding or creating user')

    if(user) {
      console.log('user found')
      resolve(user)
    }

    if(!user) {
      console.log('creating user')
      const getUserData = commandFactory('slack').setOperation('userInfo')
        .setUser(user_id).save()

      const newUserData = await exec.one(slack, getUserData)

      const {id, team_id, name, tz_label, tz_offset, is_admin} = newUserData.user

      const buildNewUser =
        commandFactory('db').setEntity('User').setOperation('create')
          .setMatch({
            user_id: id,
            team_id,
            user_name: name,
            tz_label,
            tz_offset,
            is_admin
          }).save()

      const newUser = await exec.one(dbInterface, buildNewUser)
      console.log(newUser)
      if(newUser) {
        resolve(newUser)
      } else {
        reject(new Error('user could not be found or created'))
      }
    }
  })
}
