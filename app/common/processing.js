

module.exports = function* (deps, data) {
  const {slack, commandFactory, exec} = deps
  const {text, user_id} = data

  const errorHandle = (err) => {
    return err
  }

  const getChannel =
    commandFactory('slack').setOperation('openDm').setUsers(user_id).save()

  const channel = yield exec.one(slack, getChannel).catch(errorHandle)

  const sendProcessingMessage =
    commandFactory('slack').setOperation('basicMessage')
      .setText(text).setChannel(channel.id).save()

  const ts = yield(exec.one(slack, sendProcessingMessage).catch(errorHandle))

  const deleteMessage =
    commandFactory('slack').setOperation('deleteMessage').setTs(ts)
      .setChannel(channel.id).save()

  console.log('yielding to delete processing message')
  const response = yield(exec.one(slack, deleteMessage).catch(errorHandle))

  return
}
