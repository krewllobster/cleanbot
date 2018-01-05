const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const responseSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  throwdown: { type: mongoose.Schema.Types.ObjectId, ref: 'Throwdown' },
  category: { type: Number, ref: 'Category', field: '_id' },
  correct: Boolean,
  bonus: { type: Boolean, default: false },
  coworker_id: { type: String, default: '' },
  round: Number,
  requested: Date,
  submitted: Date,
  duration: Number
});

responseSchema.plugin(findOrCreate);

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;
