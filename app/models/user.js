const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  user_id: String,
  user_name: String,
  team_id: String,
  is_admin: Boolean,
  tz_label: String,
  tz_offset: Number,
  throwdowns: [{type: mongoose.Schema.Types.ObjectId, ref: 'Throwdown'}],
  opt_in: {type: Boolean, default: true},
  profile: {
    fav_color: String,
    siblings: String,
    island: String,
    birthday_present: String,
  }
})

const User = mongoose.model("User", userSchema)

module.exports = User
