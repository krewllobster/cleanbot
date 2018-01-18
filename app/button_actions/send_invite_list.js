const { throwdownInvite } = require('../attachments');

const { processing: processingMessage } = require('../common');

module.exports = async (data, deps) => {
  const { message_ts, user_id, team_id, channel_id, throwdown_id } = data;
  const { slack, dbInterface, commandFactory, exec } = deps;

  const processing = processingMessage(deps, {
    text: 'Grabbing invite list',
    user_id
  });

  const { channel } = await processing.next().value;
  const { ts } = await processing.next(channel).value;

  const getFullThrowdown = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('findFull')
    .setMatch({ _id: throwdown_id })
    .save();

  const throwdown = await exec.one(dbInterface, getFullThrowdown);
  const attachment = throwdownInvite(throwdown);

  const inviteMessage = commandFactory('slack')
    .setOperation('updateMessage')
    .setTs(ts)
    .setChannel(channel.id)
    .setText(`Invite a user to Throwdown "${throwdown.name}"`)
    .setAttachments(attachment)
    .save();

  const response = exec.one(slack, inviteMessage);
};
