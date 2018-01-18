const { commandFactory, dbInterface, slackApi, exec } = require('../domains');

module.exports = function(agenda) {
  agenda.define('save question report', async (job, done) => {
    console.log('saving report on question');

    const {
      user,
      channel_id,
      question_id,
      description,
      submitted
    } = job.attrs.data;

    const deps = { exec, commandFactory, dbInterface };

    const getKeys = commandFactory('db')
      .setOperation('findOne')
      .setEntity('Team')
      .setMatch({ team_id: user.team_id })
      .save();

    const {
      access_token: user_token,
      bot: { bot_access_token: bot_token }
    } = await exec.one(dbInterface, getKeys);

    slack = slackApi({ user_token, bot_token });

    deps.slack = slack;

    let reportData = {
      date: submitted,
      user: user._id,
      description
    };

    const findAndUpdateQuestion = commandFactory('db')
      .setOperation('findByIdAndUpdate')
      .setEntity('Question')
      .setMatch(question_id)
      .setUpdate({ $push: { reports: reportData } })
      .setOptions({ new: true })
      .save();

    const updateResponse = await exec.one(dbInterface, findAndUpdateQuestion);

    console.log(updateResponse);

    if (updateResponse) {
      const sendReportSuccess = commandFactory('slack')
        .setOperation('ephemeralMessage')
        .setUser(user.user_id)
        .setChannel(channel_id)
        .setText('Your report has been received. Thank you!')
        .save();

      return await exec.one(slack, sendReportSuccess);
    } else {
      const sendReportError = commandFactory('slack')
        .setOperation('ephemeralMessage')
        .setUser(user.user_id)
        .setChannel(channel_id)
        .setText(
          'We were unable to save your report. Please try again in a few minutes.'
        )
        .save();

      return await exec.one(slack, sendReportError);
    }
  });
};
