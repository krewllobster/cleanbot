const mongoose = require('mongoose');

const bonusSchema = new mongoose.Schema({
  text: String,
  options: [{ type: String }],
  type: [{ type: String, enum: ['mc', 'tf', 'long'] }]
});

const Bonus = mongoose.model('Bonus', bonusSchema);

module.exports = Bonus;
