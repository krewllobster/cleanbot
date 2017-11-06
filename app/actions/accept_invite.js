module.exports = async (payload, action, deps) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id},
    original_message,
  } = payload
  const { throwdown_id, user_to_invite, owner } = JSON.parse(action.value)
  const {slack, dbInterface, commandFactory, exec, user} = deps

  const accepted = action.name === 'accept_invite'

  const updateThrowdownBase = commandFactory('db').setEntity('Throwdown')
    .setOperation('findOneAndUpdate')
    .setPopulate([
      {path: 'created_by', model: 'User'}, {path: 'participants', model: 'User'},
      {path: 'invitees', model: 'User'}, {path: 'categories', model: 'Category'}
    ]).setMatch({_id: throwdown_id})

  const replaceBase = commandFactory('slack').setOperation('updateMessage')
    .setTs(message_ts).setChannel(channel_id)

  //logic here
  const getFullThrowdown = updateThrowdownBase
    .setUpdate(
      accepted
        ? {$push: {participants: user._id}, $pull: {invitees: user._id}}
        : {$pull: {invitees: user._id}}
    ).save()

  const updatedThrowdown = await exec.one(dbInterface, getFullThrowdown)

  const replaceMessage = replaceBase
    .setText(
      accepted
        ? `Sweet! You'll get a notification when "${updatedThrowdown.name}" starts.`
        : `Ok, no problem. To receive another invite, send a message to <@${owner}>`
    ).setAttachments([]).save()

  const getOwnerChannel = commandFactory('slack').setOperation('openDm')
    .setUsers(owner).save()

  const [response, {channel}] = await exec.many([
    [slack, replaceMessage], [slack, getOwnerChannel]
  ])

  const notificationMessage =
    commandFactory('slack').setOperation('basicMessage').setChannel(channel.id)
    .setText(
      `<@${user_to_invite}> has ${accepted ? 'accepted': 'rejected'} your invitation to Throwdown: "${updatedThrowdown.name}"`
    ).save()

  exec.one(slack, notificationMessage)
}
