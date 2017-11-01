const axios          = require('axios')
const {
  commandFactory,
  dbInterface,
  exec
} = require('../domains')

module.exports = async (req, res) => {

  const auth_code = req.query.code

  if(!auth_code) {
    res.redirect('/')
    return
  }

  const uri = 'https://slack.com/api/oauth.access'

  const params = {
    client_id: process.env.SLACK_ID,
    client_secret: process.env.SLACK_SECRET,
    code: auth_code,
  }

  const {data} = await axios.get(uri, {params})

  if(!data.ok) {
    return new Error('Something in authentication controller went wrong')
  }

  const upsertTeam =
    commandFactory('db').setOperation('findOneAndUpdate').setEntity('Team')
      .setMatch({team_id: data.team_id}).setUpdate(data)
      .setOptions({upsert: true, new: true}).save()

  const team = await exec.one(dbInterface, upsertTeam)
    .catch(err => console.log(err))

  if(!team) {
    console.log('Unable to write team to db')
    res.status(500).end
  }

  console.log('installation successful for team: ' + team.team_id)
  res.redirect('/')
}
