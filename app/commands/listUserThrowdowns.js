const processingMessage = require('../common').processing;
const { singleThrowdown } = require('../attachments');

module.exports = async (body, deps) => {
  const { slack, dbInterface, commandFactory, exec, user } = deps;
  const { name, team_id, user_name, user_id, channel_id } = body;

  const processing = processingMessage(deps, {
    text: 'Fetching list of your Throwdowns',
    user_id
  });

  const { channel } = await processing.next().value;
  const { ts } = await processing.next(channel).value;

  const findAllThrowdowns = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('find')
    .setMatch({ team_id })
    .setPopulate([
      { path: 'created_by', model: 'User' },
      { path: 'participants', model: 'User' },
      { path: 'invitees', model: 'User' },
      { path: 'categories', model: 'Category' }
    ])
    .save();

  const throwdowns = await exec.one(dbInterface, findAllThrowdowns);

  const attachments = throwdowns.reduce((acc, throwdown) => {
    if (throwdown.participants.some(p => p.user_id === user_id)) {
      acc.push(singleThrowdown(throwdown, user_id, false));
    }
    return acc;
  }, []);

  const messageWithList = commandFactory('slack')
    .setOperation('updateMessage')
    .setTs(ts)
    .setChannel(channel.id)
    .setText('Your Throwdowns')
    .setAttachments(attachments)
    .save();

  if (attachments.length < 1) {
    messageWithList.text = `It looks like you aren't in any Throwdowns yet!`;
  }

  const response = await exec.one(slack, messageWithList);
};
