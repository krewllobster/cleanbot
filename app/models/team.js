const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
  access_token: {type: String, default: ''},
  team_name: {type: String, default: ''},
  team_id: {type: String, default: ''},
  scope: String,
  bot: {
    bot_access_token: String,
    bot_user_id: String,
  },
  trivia_channel: String
})

const Team = mongoose.model("Team", teamSchema)

module.exports = Team
