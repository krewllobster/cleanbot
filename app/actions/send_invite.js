const { findOrCreateUser } = require('../common');
const { throwdownInvite, acceptInviteButtons } = require('../attachments');

module.exports = async (payload, action, deps) => {
  //destructure inputs
  //payload
  const {
    user: { id: user_id },
    team: { id: team_id },
    message_ts,
    channel: { id: channel_id }
  } = payload;
  //action
  const { name: throwdown_id, selected_options } = action;
  const toInviteId = selected_options[0].value;
  //dependencies
  const { slack, dbInterface, commandFactory, exec, user } = deps;

  const getThrowdown = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('findOne')
    .setMatch({ _id: throwdown_id })
    .save();

  const throwdownExists = await exec.one(dbInterface, getThrowdown);

  if (!throwdownExists) {
    const noThrowdownMessage = commandFactory('slack')
      .setOperation('updateMessage')
      .setTs(message_ts)
      .setChannel(channel_id)
      .setText(`Look's like this Throwdown doesn't exist. Sorry!`)
      .setAttachments([])
      .save();

    return await exec.one(slack, noThrowdownMessage);
  }

  const getFullThrowdown = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('findFull')
    .setMatch({ _id: throwdown_id })
    .save();

  const [userInvited, throwdown] = await Promise.all([
    findOrCreateUser(deps, { team_id, user_id: toInviteId }),
    exec.one(dbInterface, getFullThrowdown)
  ]);
  //empty list of promise commands to concurrently execute
  let execList = [];

  if (throwdown) {
    const alreadyParticipating = throwdown.participants.some(
      p => p.user_id === userInvited.user_id
    );

    const alreadyInvited = throwdown.invitees.some(
      i => i.user_id === userInvited.user_id
    );

    if (userInvited && (alreadyParticipating || alreadyInvited)) {
      //user found and user already participant or invitee
      const cantInviteMessage = commandFactory('slack')
        .setOperation('updateMessage')
        .setChannel(channel_id)
        .setAttachments(throwdownInvite(throwdown))
        .setTs(message_ts)
        .setText(
          `<@${userInvited.user_id}> has already ${
            alreadyParticipating ? 'joined' : 'been invited'
          }!`
        )
        .save();

      execList.push([slack, cantInviteMessage]);
    } else if (userInvited && !alreadyParticipating && !alreadyInvited) {
      //user found and user not participant nor invitee

      const getChannel = commandFactory('slack')
        .setOperation('openDm')
        .setUsers(userInvited.user_id)
        .save();

      const getUpdatedThrowdown = commandFactory('db')
        .setEntity('Throwdown')
        .setOperation('findFullAndUpdate')
        .setMatch({ _id: throwdown._id })
        .setUpdate({ $push: { invitees: userInvited._id } })
        .save();

      const inviteResponse = await exec
        .one(slack, getChannel)
        .catch(async err => {
          return false;
        });

      if (!inviteResponse) {
        const rejectionNotice = commandFactory('slack')
          .setOperation('updateMessage')
          .setChannel(channel_id)
          .setTs(message_ts)
          .setText('You were unable to invite this user. They may be a bot!')
          .save();

        return await exec.one(slack, rejectionNotice);
      }

      const { channel: inviteeChannel } = inviteResponse;

      const updatedThrowdown = exec.one(dbInterface, getUpdatedThrowdown);

      const inviteMessage = commandFactory('slack')
        .setOperation('basicMessage')
        .setChannel(inviteeChannel.id)
        .setText(
          `<@${
            updatedThrowdown.created_by.user_id
          }> has invited you to their new Throwdown: "${updatedThrowdown.name}"`
        )
        .setAttachments(
          acceptInviteButtons({
            throwdown_id: updatedThrowdown._id,
            user_to_invite: userInvited.user_id,
            owner: user_id,
            team_id
          })
        )
        .save();

      const newAttachment = throwdownInvite(updatedThrowdown);

      const inviteNotification = commandFactory('slack')
        .setOperation('updateMessage')
        .setChannel(channel_id)
        .setAttachments(newAttachment)
        .setTs(message_ts)
        .setText(`I've sent an invite to <@${userInvited.user_id}>`)
        .save();

      execList.push([slack, inviteMessage]);
      execList.push([slack, inviteNotification]);
    }
  }

  const response = await exec.many(execList);
};
