const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const throwdownSchema = new mongoose.Schema(
  {
    name: String,
    categories: [{ type: Number, ref: 'Category', field: '_id', default: 9 }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    invitees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    description: String,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team_id: String,
    start_date: Date,
    privacy: String,
    channel: String,
    round: { type: Number, default: 0 },
    questions: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        round: Number
      }
    ]
  },
  { toObject: { virtuals: true } }
);

throwdownSchema.plugin(findOrCreate);

throwdownSchema.statics.findFull = function(match) {
  return this.findOne(match).populate([
    { path: 'created_by', model: 'User' },
    { path: 'participants', model: 'User' },
    { path: 'invitees', model: 'User' },
    { path: 'categories', model: 'Category' },
    { path: 'questions.question', model: 'Question' }
  ]);
};

throwdownSchema.statics.findAll = function(match) {
  return this.find(match).populate([
    { path: 'created_by', model: 'User' },
    { path: 'participants', model: 'User' },
    { path: 'invitees', model: 'User' },
    { path: 'categories', model: 'Category' },
    { path: 'questions.question', model: 'Question' }
  ]);
};

const Throwdown = mongoose.model('Throwdown', throwdownSchema);

module.exports = Throwdown;
