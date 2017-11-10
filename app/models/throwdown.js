const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')

const throwdownSchema = new mongoose.Schema({
  name: String,
  categories: [{type: Number, ref: 'Category', field: '_id', default: 9}],
  participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  invitees: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  description: String,
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  team_id: String,
  start_date: Date,
  privacy: String,
  channel: String,
  round: {type: Number, default: 0},
  questions: [{
    question: {type: mongoose.Schema.Types.ObjectId, ref: 'Question'},
    round: Number
  }],
  responses: [{
    question: {type: mongoose.Schema.Types.ObjectId, ref: 'Question'},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    throwdown: {type: mongoose.Schema.Types.ObjectId, ref: 'Throwdown'},
    correct: Boolean,
    requested: Date,
    submitted: Date,
  }]
}, {toObject: {virtuals:  true}})


throwdownSchema.plugin(findOrCreate)

const Throwdown = mongoose.model("Throwdown", throwdownSchema)

module.exports = Throwdown
