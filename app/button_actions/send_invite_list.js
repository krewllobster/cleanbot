const messageList = require('../messages')
const {
  findFullThrowdown,
  processing: processingMessage
} = require('../common')

module.exports = async ({
  message_ts,
  user_id,
  team_id,
  channel_id,
  throwdown_id
}, deps) => {
  const {slack, commandFactory, exec} = deps

  const processing = processingMessage(deps, {
    text: 'Grabbing invite list',
    user_id
  })

  const {channel} = await processing.next().value
  const {ts} = await processing.next(channel).value

  const throwdown = await findFullThrowdown(deps, {matchFields: {_id: throwdown_id}})
  console.log(throwdown)
  const attachment = messageList.throwdown_invite(throwdown)
  console.log(attachment)
  const inviteMessage = commandFactory('slack').setOperation('updateMessage')
    .setTs(ts).setChannel(channel.id)
    .setText(`Invite a user to Throwdown "${throwdown.name}"`)
    .setAttachments(attachment)
    .save()

  const response = exec.one(slack, inviteMessage)
}
