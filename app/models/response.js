const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const responseSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  throwdown: { type: mongoose.Schema.Types.ObjectId, ref: 'Throwdown' },
  category: { type: Number, ref: 'Category', field: '_id' },
  correct: Boolean,
  bonus: { type: Boolean, default: false },
  round: Number,
  requested: Date,
  submitted: Date,
  duration: Number
});

responseSchema.plugin(findOrCreate);

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;

// db.responses.aggregate([
//   {
//     $lookup: {
//       from: 'users',
//       localField: 'user',
//       foreignField: '_id',
//       as: 'fullUser'
//     }
//   },
//   {$addFields: {user_name: "$fullUser.user_name"}},
//   {$unwind: "$user_name"},
//   {$group: {
//     _id: {
//       user: "$user_name",
//       round: "$round",
//       correct: "$correct"
//     },
//     count: {$sum: 1},
//     total: {$sum: "$duration"},
//     average: {$avg: "$duration"}
//   }},
// ])
//
//
//
//
// {$group: {
//   _id: {
//     user: "$user_name",
//     correct: "$correct"
//   },
//   count: {$sum: 1},
//   total: {$sum: "$duration"},
//   average: {$avg: "$duration"}
// }}
//
// {
//  $lookup:
//    {
//      from: <collection to join>,
//      localField: <field from the input documents>,
//      foreignField: <field from the documents of the "from" collection>,
//      as: <output array field>
//    }
//  },
