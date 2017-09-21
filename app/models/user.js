const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  user_id: String,
  user_name: String,
  team_id: String,
  throwdowns: [{type: mongoose.Schema.Types.ObjectId, ref: 'Throwdown'}],
  opt_in: {type: Boolean, default: true},
  profile: {
    "Desert_Island": String,
    "Favorite_Color": String,
  }
})

const User = mongoose.model("User", userSchema)

module.exports = User
