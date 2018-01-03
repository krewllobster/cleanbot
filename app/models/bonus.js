const mongoose = require('mongoose');

const bonusSchema = new mongoose.Schema({
  text: String,
  shortName: String,
  options: [{ type: String }],
  answerType: { type: String, enum: ['mc', 'tf', 'long'] },
  questionType: { type: String, enum: ['preference', 'experience'] }
});

const Bonus = mongoose.model('Bonus', bonusSchema);

module.exports = Bonus;
