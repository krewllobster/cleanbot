const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  category: {type: Number, ref: 'Category', field: '_id'},
  text: String,
  answers: [
    {text: String, correct: Boolean}
  ],
  type: String,
  difficulty: String
})

const Question = mongoose.model("Question", questionSchema)

module.exports = Question
