const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')

const responseSchema = new mongoose.Schema({
  question: {type: mongoose.Schema.Types.ObjectId, ref: 'Question'},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  throwdown: {type: mongoose.Schema.Types.ObjectId, ref: 'Throwdown'},
  correct: Boolean,
  requested: Date,
  submitted: Date,
})


responseSchema.plugin(findOrCreate)

const Response = mongoose.model("Response", responseSchema)

module.exports = Response
