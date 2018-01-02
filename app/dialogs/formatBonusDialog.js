// const userDataSchema = new mongoose.Schema({
//   bonus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bonus' },
//   shortName: { type: String },
//   response: { type: String },
//   user_id: { type: String },
//   team_id: { type: String },
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   throwdown: { type: mongoose.Schema.Types.ObjectId, ref: 'Throwdown' },
//   round: { type: Number }
// });

module.exports = (bonus, { user, throwdown, round }) => {
  const cbObjDetails = {
    bonus: bonus._id,
    shortName: bonus.shortName,
    user: user._id,
    throwdown,
    round
  };
  const cbObj = {
    callback_id: 'save_user_data',
    details: cbObjDetails
  };
  return JSON.stringify({
    callback_id: JSON.stringify(cbObj),
    title: 'Bonus Question!',
    submit_label: 'Submit!',
    elements: [
      {
        type: 'textarea',
        name: 'response',
        label: bonus.shortName,
        hint: bonus.text
      }
    ]
  });
};
