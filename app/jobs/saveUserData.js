const { selectQuestionButtons, roundSummary } = require('../attachments');
const { commandFactory, dbInterface, slackApi, exec } = require('../domains');

module.exports = function(agenda) {
  agenda.define('save user data', async (job, done) => {
    console.log('starting save user data job');
    const {
      question_id,
      shortName,
      response,
      user,
      throwdown,
      round,
      channel_id
    } = job.attrs.data;

    const getKeys = commandFactory('db')
      .setOperation('findOne')
      .setEntity('Team')
      .setMatch({ team_id: user.team_id })
      .save();

    const {
      access_token: user_token,
      bot: { bot_access_token: bot_token }
    } = await exec.one(dbInterface, getKeys);

    const slack = slackApi({ user_token, bot_token });

    const deps = { slack, exec, commandFactory, dbInterface, user };

    const newdata = {
      question: question_id,
      shortName,
      response,
      user_id: user.user_id,
      team_id: user.team_id,
      user: user._id,
      throwdown,
      round
    };

    const updateResponse = commandFactory('db')
      .setEntity('Response')
      .setOperation('findOneAndUpdate')
      .setMatch({
        question: question_id,
        user: user._id,
        throwdown,
        round
      })
      .setUpdate({ $set: { responded: true } })
      .save();

    const saveData = commandFactory('db')
      .setEntity('UserData')
      .setOperation('update')
      .setMatch({
        question: question_id,
        user: user._id
      })
      .setUpdate(newdata)
      .setOptions({ upsert: true, new: true })
      .save();

    const serverResponse = await exec.many([
      [dbInterface, saveData],
      [dbInterface, updateResponse]
    ]);

    const successText = `Sweet! This might be part of a future bonus question :)`;

    const questionAttachments = await selectQuestionButtons(
      throwdown,
      round,
      deps
    );

    console.log(serverResponse);

    const rSummary = await roundSummary({ throwdown, round }, deps);

    if (rSummary && !!questionAttachments)
      questionAttachments.unshift(rSummary);

    const successMessage = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setChannel(channel_id)
      .setUser(user.user_id)
      .setText(successText)
      .setAttachments(questionAttachments)
      .save();

    const errorMessage = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setChannel(channel_id)
      .setUser(user.user_id)
      .setText(
        'Whoops, it looks like something went wrong saving your answer. Please try again!'
      )
      .setAttachments(questionAttachments)
      .save();

    if (serverResponse) {
      await exec.one(slack, successMessage);
    } else {
      await exec.one(slack, errorMessage);
    }
    agenda.cancel({ _id: job.attrs._id }, (err, numRemove) => {
      console.log(`successfully removed ${numRemove} job(s)`);
      done();
    });
  });
};
