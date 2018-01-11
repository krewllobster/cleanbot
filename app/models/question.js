const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  category: { type: Number, ref: 'Category', field: '_id' },
  text: String,
  shortName: { type: String, default: '' },
  answers: [{ text: String, correct: Boolean }],
  answerType: String,
  questionType: { type: String, default: '' },
  difficulty: String,
  bonus: { type: Boolean, default: false },
  reports: [
    {
      date: Date,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      description: String
    }
  ]
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
