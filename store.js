const WebClient       = require('@slack/client').WebClient
const SlackApi        = require('./app/domains/slackApi')

//models and reducers
const { Team }        = require('./app/models')

module.exports = function () {

  return function (req, res, next) {

    let team_id

    if(req.body.team_id) {
      return Team.findOne({team_id: req.body.team_id})
        .then(team => {
          if(team) {
            res.webClient = new WebClient(team.access_token)
            res.botClient = new WebClient(team.bot.bot_access_token)
            res.SlackApi  = new SlackApi({
              user_token: team.access_token,
              bot_token: team.bot.bot_access_token
            })
            res.botId = team.bot.bot_user_id
          }
          return next()
        })
        .catch(next)
    }

    if (req.body.payload) {
      let id = JSON.parse(req.body.payload).team.id
      return Team.findOne({team_id: id})
        .then(team => {
          if(team) {
            res.webClient = new WebClient(team.access_token)
            res.botClient = new WebClient(team.bot.bot_access_token)
            res.botId = team.bot.bot_user_id
          }
          return next()
        })
        .catch(next)
    }
  }
}
