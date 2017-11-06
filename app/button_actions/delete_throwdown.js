
module.exports = async (data, deps) => {

  const {message_ts, user_id, team_id, channel_id, throwdown_id, public} = data
  const {slack, dbInterface, commandFactory, exec, user} = deps

  const removeThrowdown = commandFactory('db').setEntity('Throwdown')
    .setOperation('findOneAndRemove').setMatch({_id: throwdown_id})
    .setPopulate([
      {path: 'created_by', model: 'User'}, {path: 'participants', model: 'User'},
      {path: 'invitees', model: 'User'}, {path: 'categories', model: 'Category'}
    ]).save()

  const deletedThrowdown = await exec.one(dbInterface, removeThrowdown)

  const execList = []

  const successfulDelete = commandFactory('slack').setOperation('updateMessage')
    .setTs(message_ts).setChannel(channel_id)
    .setText(`Throwdown "${deletedThrowdown.name}" has been successfully deleted`)
    .setAttachments([]).save()

  const response = await exec.one(slack, successfulDelete)

  deletedThrowdown.participants.forEach(p => {
    if(p.user_id !== deletedThrowdown.created_by.user_id) {
      const getChannel = commandFactory('slack').setOperation('openDm')
        .setUsers(p.user_id).save()
      execList.push([slack, getChannel])
    }
  })

  const channels = await exec.many(execList)

  const messageList = []

  channels.forEach(({channel}) => {
    const deletedMessage = commandFactory('slack').setOperation('basicMessage')
      .setChannel(channel.id).setText(
        `Throwdown "${deletedThrowdown.name}" has been deleted by ${deletedThrowdown.created_by.user_id}`
      ).save()

    messageList.push([slack, deletedMessage])
  })

  const responses = await exec.many(messageList)

  const underName = deletedThrowdown.name.split(' ').join('_').substring(0,12)

  const renameChannel = commandFactory('slack').setOperation('renameConversation')
    .setChannel(deletedThrowdown.channel)
    .setClient('userClient').setName(underName + '_deleted').save()

  await exec.one(slack, renameChannel)

  const archiveChannel = commandFactory('slack').setOperation('archiveConversation')
    .setChannel(deletedThrowdown.channel).setClient('userClient').save()

  await exec.one(slack, archiveChannel)
}
