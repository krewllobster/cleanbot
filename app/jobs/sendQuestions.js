const { commandFactory, dbInterface, slackApi, exec } = require('../domains');

const { findFullThrowdown } = require('../common');
const { getQuestions } = require('../attachments');

module.exports = function(agenda) {
  agenda.define('send question buttons', async (job, done) => {
    console.log('starting send questions job');
    const { throwdown_id, team_id, user } = job.attrs.data;

    const deps = { exec, commandFactory, dbInterface };

    const getKeys = commandFactory('db')
      .setOperation('findOne')
      .setEntity('Team')
      .setMatch({ team_id })
      .save();

    const {
      access_token: user_token,
      bot: { bot_access_token: bot_token }
    } = await exec.one(dbInterface, getKeys);

    slack = slackApi({ user_token, bot_token });

    deps.slack = slack;

    const fullThrowdown = await findFullThrowdown(deps, {
      matchFields: { _id: throwdown_id },
      updateFields: { $inc: { round: 1 } }
    });

    console.log('full throwdown found. round is: ', fullThrowdown.round);

    if (fullThrowdown.round > 10) {
      console.log('throwdown round is past 10, need to terminate job');
      agenda.cancel({ _id: job._id }, (err, numRemove) => {
        console.log(`successfully removed ${numRemove} job(s)`);
      });
      return done();
    }

    const questionButton = getQuestions(fullThrowdown, user);
    console.log('questionButton');
    console.log(questionButton);
    const sendQuestions = commandFactory('slack')
      .setOperation('basicMessage')
      .setAttachments([questionButton])
      .setChannel(fullThrowdown.channel)
      .save();

    console.log('send question command', sendQuestions);

    const { ts } = await exec
      .one(slack, sendQuestions)
      .catch(e => console.log(e));

    console.log('returned timestamp: ', ts);

    const pinQuestions = commandFactory('slack')
      .setOperation('addPin')
      .setChannel(fullThrowdown.channel)
      .setTs(ts)
      .save();

    await exec.one(slack, pinQuestions);

    console.log('questions sent');

    done();
  });
};
