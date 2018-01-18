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

  const updateThrowdown = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('findOneAndUpdate')
    .setMatch({ _id: throwdown_id })
    .setUpdate({ $pull: { participants: user._id } })
    .setOptions({ new: true })
    .save();

  const throwdown = await exec.one(dbInterface, updateThrowdown);

  const getUpdatedList = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('findAll')
    .setMatch({ team_id })
    .save();

  const throwdownList = await exec.one(dbInterface, getUpdatedList);

  const confirm = commandFactory('slack')
    .setOperation('updateMessage')
    .setTs(message_ts)
    .setChannel(channel_id);

  const publicThrowdowns = throwdownList
    .filter(td => {
      return td.privacy === 'public';
    })
    .map(td => {
      return singleThrowdown(td, user_id, public);
    });

  const privateThrowdowns = throwdownList
    .filter(td => {
      return td.participants.some(p => p.user_id === user.user_id);
    })
    .map(td => {
      return singleThrowdown(td, user_id, public);
    });

  let confirmationMessage;

  if (public && user && throwdown) {
    confirmationMessage = confirm
      .setAttachments(publicThrowdowns)
      .setText(
        `You have left Throwdown "${throwdown.name}"\nPublic Throwdowns:`
      )
      .save();
  } else if (!public && user && throwdown) {
    const count = privateThrowdowns.length;
    console.log('user has ' + count + ' throwdowns');
    const textAddition =
      count < 1
        ? `\nLook's like you are not participating in any Throwdowns`
        : `\nYour Throwdowns:`;

    confirmationMessage = confirm
      .setAttachments(privateThrowdowns)
      .setText(`You have left Throwdown "${throwdown.name}"` + textAddition)
      .save();
  } else if (!user || !throwdown) {
    confirmationMessage = confirm
      .setText(
        `Something has changed since this message was sent. Please refresh with a new "/rumble" command.`
      )
      .save();
  }

  const kickUser = commandFactory('slack')
    .setOperation('kickFromConversation')
    .setUser(user.user_id)
    .setChannel(throwdown.channel)
    .setClient('userClient')
    .save();

  console.log(kickUser);
  exec.many([[slack, confirmationMessage], [slack, kickUser]]);
};
