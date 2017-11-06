

module.exports = async ({token, team_id}, res, domains) => {

  const {commandFactory, dbInterface, exec, slackApi} = domains

  const errorHandle = (err) => {
    throw new Error('error in Command Controller::' + err)
  }

  if(token !== process.env.SLACK_VERIFICATION_TOKEN) {
    throw new Error('token does not match, invalid request')
  }
  //end with 200 here to let slack client know command received
  res.status(200).end()

  const getKeys =
    commandFactory('db').setEntity('Team').setOperation('findOne')
      .setMatch({team_id: team_id}).save()

  const {
    access_token: user_token,
    bot: {bot_access_token: bot_token}
  } = await exec.one(dbInterface, getKeys).catch(errorHandle)

  const slack = slackApi({user_token, bot_token})

  return slack
}
