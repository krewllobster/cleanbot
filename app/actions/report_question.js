const agenda = require('../../agenda');

module.exports = async (payload, submission, deps) => {
  const {
    team: { id: team_id },
    user: { id: user_id },
    channel: { id: channel_id }
  } = payload;

  const { question_id, description } = submission;
  const { slack, dbInterface, commandFactory, exec, user } = deps;

  const jobData = {
    channel_id,
    description,
    question_id,
    submitted: new Date(),
    user
  };

  agenda.now('save question report', jobData);

  // console.log('reporting question');

  // let reportData = {
  //   date: new Date(),
  //   user: user._id,
  //   description
  // };

  // const findAndUpdateQuestion = commandFactory('db')
  //   .setOperation('findByIdAndUpdate')
  //   .setEntity('Question')
  //   .setMatch(question_id)
  //   .setUpdate({ $push: { reports: reportData } })
  //   .setOptions({ new: true })
  //   .save();

  // const updateResponse = await exec.one(dbInterface, findAndUpdateQuestion);

  // console.log(updateResponse);

  // if (updateResponse) {
  //   const sendReportSuccess = commandFactory('slack')
  //     .setOperation('ephemeralMessage')
  //     .setUser(user_id)
  //     .setChannel(channel_id)
  //     .setText('Your report has been received. Thank you!')
  //     .save();

  //   return await exec.one(slack, sendReportSuccess);
  // } else {
  //   const sendReportError = commandFactory('slack')
  //     .setOperation('ephemeralMessage')
  //     .setUser(user_id)
  //     .setChannel(channel_id)
  //     .setText(
  //       'We were unable to save your report. Please try again in a few minutes.'
  //     )
  //     .save();

  //   return await exec.one(slack, sendReportError);
  // }
};
