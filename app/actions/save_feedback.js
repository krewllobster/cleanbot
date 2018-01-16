const agenda = require('../../agenda');

module.exports = async (payload, submission, deps) => {
  const { channel: { id: channel_id } } = payload;

  const { description } = submission;
  const { user } = deps;
  const submitted = new Date();

  const jobData = {
    channel_id,
    description,
    submitted,
    user
  };

  agenda.now('save feedback', jobData);
};

// module.exports = async (payload, submission, deps) => {
//   const {
//     team: { id: team_id },
//     user: { id: user_id },
//     channel: { id: channel_id }
//   } = payload;

//   const { description } = submission;
//   const { slack, dbInterface, commandFactory, exec, user } = deps;

//   let feedbackData = {
//     date: new Date(),
//     user: user._id,
//     description
//   };

//   // await Feedback.create(feedbackData);
//   const findAndUpdateFeedback = commandFactory('db')
//     .setOperation('update')
//     .setEntity('Feedback')
//     .setMatch(feedbackData)
//     .setUpdate(feedbackData)
//     .setOptions({ new: true, upsert: true })
//     .save();

//   const updateResponse = await exec.one(dbInterface, findAndUpdateFeedback);

//   console.log(updateResponse);

//   if (updateResponse) {
//     const sendReportSuccess = commandFactory('slack')
//       .setOperation('ephemeralMessage')
//       .setUser(user_id)
//       .setChannel(channel_id)
//       .setText('Your feedback has been received. Thank you!')
//       .save();

//     return await exec.one(slack, sendReportSuccess);
//   } else {
//     const sendReportError = commandFactory('slack')
//       .setOperation('ephemeralMessage')
//       .setUser(user_id)
//       .setChannel(channel_id)
//       .setText(
//         'We were unable to save your feedback. Please try again in a few minutes.'
//       )
//       .save();

//     return await exec.one(slack, sendReportError);
//   }
// };
