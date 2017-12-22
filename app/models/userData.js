const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  bonus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bonus' },
  shortName: { type: String },
  response: { type: String },
  user_id: { type: String },
  team_id: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  throwdown: { type: mongoose.Schema.Types.ObjectId, ref: 'Throwdown' },
  round: { type: Number }
});

const UserData = mongoose.model('UserData', userDataSchema);

module.exports = UserData;
