
module.exports = async (body, res, deps) => {
  const {dbInterface, commandFactory, exec, slackApi} = deps
  const errorHandle = (err) => {
    throw new Error('error in Command Controller::' + err)
  }

  if(body.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    throw new Error('token does not match, invalid request')
  }
  //end with 200 here to let slack client know command received
  res.status(200).end()

  const getKeys =
    commandFactory('db').setEntity('Team').setOperation('findOne')
      .setMatch({team_id: body.team_id}).save()

  const {
    access_token: user_token,
    bot: {bot_access_token: bot_token}
  } = await exec.one(dbInterface, getKeys).catch(errorHandle)

  const slack = slackApi({user_token, bot_token})

  const findUser =
    commandFactory('db').setEntity('User').setOperation('findOne')
      .setMatch({user_id: body.user_id, team_id: body.team_id}).save()

  let user = await exec.one(dbInterface, findUser).catch(errorHandle)

  if(!user) {
    const getUserData =
      commandFactory('slack').setOperation('userInfo')
        .setUser(body.user_id).save()

    const userData = await exec.one(slack, getUserData).catch(errorHandle)

    const {id, team_id, name, tz_label, tz_offset, is_admin} = userData.user

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
    user = await exec.one(dbInterface, buildNewUser).catch(errorHandle)
  }

  if(!user) {
    throw new Error('user not found or not created')
  }

  return {slack, dbInterface, commandFactory, exec, user}
}
