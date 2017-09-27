const WebClient       = require('@slack/client').WebClient

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
            res.botId = team.bot.bot_user_id
          }
          return next()
        })
        .catch(err => next(err))
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
        .catch(err => next(err))
    }
  }
}
