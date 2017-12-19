const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  bonus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bonus' },
  response: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
});

const UserData = mongoose.model('UserData', userDataSchema);

module.exports = UserData;
