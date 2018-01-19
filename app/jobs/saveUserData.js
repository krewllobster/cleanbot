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
      throwdown: throwdown_id,
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
      throwdown: throwdown_id,
      round
    };

    const updateResponse = commandFactory('db')
      .setEntity('Response')
      .setOperation('findOneAndUpdate')
      .setMatch({
        question: question_id,
        user: user._id,
        throwdown: throwdown_id,
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

    //ALL responses belonging to user
    const getResponses = commandFactory('db')
      .setEntity('Response')
      .setOperation('find')
      .setMatch({ user: user._id })
      .setPopulate('question')
      .save();

    //questions belonging to throwdown
    const getQuestions = commandFactory('db')
      .setEntity('Throwdown')
      .setOperation('findOne')
      .setMatch({ _id: throwdown_id })
      .setPopulate([{ path: 'questions.question', model: 'Question' }])
      .save();

    //userData belonging to user from this throwdown
    const getUserData = commandFactory('db')
      .setEntity('UserData')
      .setOperation('find')
      .setMatch({
        user: user._id
      })
      .save();

    const [responses, throwdownQuestions, userData] = await exec.many([
      [dbInterface, getResponses],
      [dbInterface, getQuestions],
      [dbInterface, getUserData]
    ]);

    let questionAttachments = selectQuestionButtons(throwdown_id, round, {
      responses,
      throwdown: throwdownQuestions,
      userData,
      user
    });

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
