const messages = require('../messages')
const { findOrCreateUser, findFullThrowdown } = require('../common')

module.exports = async (payload, action, deps) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id}
  } = payload

  const {slack, dbInterface, commandFactory, exec, user} = deps

  const userInvited = await findOrCreateUser(deps, {team_id, user_id})
  const throwdown = await findFullThrowdown(deps, {matchFields: {_id: action.name}})
  console.log('already invited')

  let execList = []

  const basicMessage = commandFactory('slack').setOperation('basicMessage')
    .setChannel(channel_id)

  if (!throwdown) {
    const noThrowdownMessage =
      commandFactory('slack').setOperation('updateMessage').setTs(message_ts)
        .setChannel(channel_id)
        .setText(`Look's like this Throwdown doesn't exist. Sorry!`).save()

    execList.push([slack, noThrowdownMessage])
  }

  if (throwdown) {
    console.log('has throwdown, continuing')
    const hasPart = throwdown.participants.map(p => p.user_id).includes(userInvited.user_id)
    const hasInvt = throwdown.invitees.map(i => i.user_id).includes(userInvited.user_id)
    console.log('bools')
    console.log(hasPart, hasInvt)
    if (userInvited && (hasPart || hasInvt)) {
      const errMessage = basicMessage
        .setText(
          `<@${userInvited.user_id}> has already ${hasPart ? 'joined' : 'been invited'}!`
        ).setAttachments([messages.throwdown_invite(throwdown)]).save()

      execList.push([slack, errMessage])

    } else if (userInvited && !hasPart && !hasInvt) {
      const updatedThrowdown = await findFullThrowdown(deps, {
        matchFields: {_id: throwdown._id},
        updateFields: {$push: {invitees: userInvited._id}}
      })

      const inviteMessage =
        basicMessage.setText(
          `<@${updatedThrowdown.created_by.user_id}> has invited you to their new Throwdown: "${updatedThrowdown.name}"`
        ).setAttachment(
          messages.accept_invite({
            throwdown_id: updatedThrowdown._id,
            user_to_invite: userInvited.user_id,
            owner: user_id, team_id
          })
        ).save()

      const inviteNotification =
        basicMessage.setText(
          `I've sent an invite to <@${userInvited.user_id}>`
        ).setAttachment(
          messages.throwdown_invite(updatedThrowdown)
        ).save()

      execList.push([slack, inviteMessage]).push([slack, inviteNotification])
    }
  }

  const response = await exec.many(execList)
}
