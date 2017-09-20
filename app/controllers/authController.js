const axios          = require('axios')

const { upsertTeam } = require('../db_actions')

module.exports = (req, res) => {

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

  return axios.get(uri, {params})
    .then(response => {
      const body = response.data
      if(!body.ok) {
        return new Error('Something in auth went wrong')
      }
      return body
    })
    .then(body => {
      return upsertTeam(body)
    })
    .then(team => {
      console.log('team inserted to mongo')
      console.log(team)
      res.redirect('/')
    })
    .catch(err => {
      console.log('auth err::'+err)
      res.status(500).end
    })
}
