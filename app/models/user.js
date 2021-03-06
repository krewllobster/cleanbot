const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  user_id: String,
  user_name: String,
  team_id: String,
  is_admin: Boolean,
  tz_label: String,
  tz_offset: Number,
  opt_in: {type: Boolean, default: true},
  display_name: String,
})

const User = mongoose.model("User", userSchema)

module.exports = User
