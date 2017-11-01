

module.exports = async (deps, data) => {
  const {slack, dbInterface, commandFactory, exec} = deps
  const {user_id, team_id} = data

  const findUser = commandFactory('db').setOperation('find')
    .setEntity('User').setMatch({team_id, user_id}).save()

  const user = await exec.one(dbInterface, findUser)

  if(user) {
    console.log(user)
    return user
  }

  if(!user) {
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

    if(newUser) {
      return newUser
    } else {
      return new Error('user could not be found or created')
    }
  }
}
