const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  _id: Number,
  name: String,
  questions: []
})

const Category = mongoose.model("Category", categorySchema)

module.exports = Category
