const { commandFactory, dbInterface, slackApi, exec } = require('../domains');

module.exports = function(agenda) {
  agenda.define('save feedback', async (job, done) => {
    console.log('saving feedback from job');

    const { user, channel_id, description, submitted } = job.attrs.data;

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

    let feedbackData = {
      date: submitted,
      user: user._id,
      description
    };

    const findAndUpdateFeedback = commandFactory('db')
      .setOperation('update')
      .setEntity('Feedback')
      .setMatch(feedbackData)
      .setUpdate(feedbackData)
      .setOptions({ new: true, upsert: true })
      .save();

    const updateResponse = await exec.one(dbInterface, findAndUpdateFeedback);

    if (updateResponse) {
      const sendFeedbackSuccess = commandFactory('slack')
        .setOperation('ephemeralMessage')
        .setUser(user.user_id)
        .setChannel(channel_id)
        .setText('Your feedback has been received and saved. Thank you!')
        .save();

      await exec.one(dbInterface, sendFeedbackSuccess);
    } else {
      const sendReportError = commandFactory('slack')
        .setOperation('ephemeralMessage')
        .setUser(user.user_id)
        .setChannel(channel_id)
        .setText(
          'We were unable to save your feedback. Please try again in a few minutes.'
        )
        .save();

      await exec.one(slack, sendReportError);
    }

    done();
  });
};
