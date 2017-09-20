const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')

const throwdownSchema = new mongoose.Schema({
  name: String,
  categories: [{type: Number, ref: 'Category', field: '_id'}],
  participants: [{type: String, ref: 'User', field: '_id'}],
  created_by: {type: String, ref: 'User', field: '_id'},
  team_id: String,
  start_date: Date,
  privacy: String,
}, {toObject: {virtuals:  true}})


throwdownSchema.plugin(findOrCreate)

const Throwdown = mongoose.model("Throwdown", throwdownSchema)

module.exports = Throwdown
