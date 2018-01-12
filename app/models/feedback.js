const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  date: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
