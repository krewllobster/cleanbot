const { findFullThrowdown, findAllThrowdowns } = require('../common');
const { singleThrowdown } = require('../attachments');

module.exports = async (data, deps) => {
  const {
    message_ts,
    user_id,
    team_id,
    channel_id,
    throwdown_id,
    public
  } = data;
  const { slack, dbInterface, commandFactory, exec, user } = deps;

  const updateThrowdownParticipant = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('update')
    .setmatch({ _id: throwdown_id })
    .setUpdate({ $push: { participants: user_id } })
    .save();

  const throwdown = await exec.one(dbInterface, updateThrowdownParticipant);
  // const throwdown = await findFullThrowdown(deps, {
  //   matchFields: { _id: throwdown_id },
  //   updateFields: { $push: { participants: user._id } }
  // });

  const confirmMessageBase = commandFactory('slack')
    .setOperation('updateMessage')
    .setText(
      `You've joined Throwdown "${throwdown.name}"!` +
        `${public ? '\nPublic Throwdowns:' : '\nYour Throwdowns'}`
    )
    .setTs(message_ts)
    .setChannel(channel_id);

  const getAllThrowdowns = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('findAll')
    .setMatch({ team_id })
    .save();

  const throwdownList = await exec.one(dbInterface, getAllThrowdowns);

  const publicThrowdowns = [],
    privateThrowdowns = [];

  throwdownList.forEach(td => {
    if (td.privacy === 'public') {
      publicThrowdowns.push(singleThrowdown(td, user_id, public));
    }
    if (td.participants.some(p => p.user_id === user.user_id)) {
      privateThrowdowns.push(singleThrowdown(td, user_id, public));
    }
  });

  let confirmationMessage;

  if (public && user && throwdown) {
    confirmationMessage = confirmMessageBase
      .setAttachments(publicThrowdowns)
      .save();
  } else if (!public && user && throwdown) {
    const count = privateThrowdowns.length;
    const textAddition =
      count < 1
        ? `\nLook's like you are not participating in any Throwdowns`
        : `\nYour Throwdowns:`;

    confirmationMessage = confirmMessageBase
      .setAttachments(privateThrowdowns)
      .save();
  }

  const inviteUser = commandFactory('slack')
    .setOperation('inviteToConversation')
    .setUsers(user.user_id)
    .setChannel(throwdown.channel)
    .setClient('userClient')
    .save();

  exec.many([[slack, confirmationMessage], [slack, inviteUser]]);
};
