const { findOrCreateUser, findFullThrowdown } = require('../common')
const { throwdownInvite, acceptInviteButtons } = require('../attachments')

module.exports = async (payload, action, deps) => {
  //destructure inputs
  //payload
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id}
  } = payload
  //action
  const {name, selected_options} = action
  const toInviteId = selected_options[0].value
  //dependencies
  const {slack, dbInterface, commandFactory, exec, user} = deps

  const [userInvited, throwdown] = await Promise.all([
    findOrCreateUser(deps, {team_id, user_id: toInviteId}),
    findFullThrowdown(deps, {matchFields: {_id: action.name}})
  ])
  //empty list of promise commands to concurrently execute
  let execList = []

  if (!throwdown) {
    const noThrowdownMessage = commandFactory('slack')
        .setOperation('updateMessage').setTs(message_ts)
        .setChannel(channel_id)
        .setText(`Look's like this Throwdown doesn't exist. Sorry!`).save()

    execList.push([slack, noThrowdownMessage])
  }

  if (throwdown) {
    const alreadyParticipating =
      throwdown.participants.some(p => p.user_id === userInvited.user_id)

    const alreadyInvited =
      throwdown.invitees.some(i => i.user_id === userInvited.user_id)

    if (userInvited && (alreadyParticipating || alreadyInvited)) {
      //user found and user already participant or invitee
      const cantInviteMessage =
        commandFactory('slack').setOperation('updateMessage')
          .setChannel(channel_id).setAttachments(throwdownInvite(throwdown))
          .setTs(message_ts).setText(
            `<@${userInvited.user_id}> has already ${alreadyParticipating ? 'joined' : 'been invited'}!`
          ).save()

      execList.push([slack, cantInviteMessage])

    } else if (userInvited && !alreadyParticipating && !alreadyInvited) {
      //user found and user not participant nor invitee

      const getChannel = commandFactory('slack').setOperation('openDm')
        .setUsers(userInvited.user_id).save()

      const getThrowdown = findFullThrowdown(deps, {
        matchFields: {_id: throwdown._id},
        updateFields: {$push: {invitees: userInvited._id}}
      })

      const [{channel: inviteeChannel}, updatedThrowdown] = await Promise.all([
        exec.one(slack, getChannel), getThrowdown
      ])

      const inviteMessage =
        commandFactory('slack').setOperation('basicMessage')
          .setChannel(inviteeChannel.id).setText(
            `<@${updatedThrowdown.created_by.user_id}> has invited you to their new Throwdown: "${updatedThrowdown.name}"`
          ).setAttachments(
            acceptInviteButtons({
              throwdown_id: updatedThrowdown._id,
              user_to_invite: userInvited.user_id,
              owner: user_id, team_id
            })
          ).save()

      const newAttachment = throwdownInvite(updatedThrowdown)

      const inviteNotification =
        commandFactory('slack').setOperation('updateMessage')
          .setChannel(channel_id)
          .setAttachments(newAttachment)
          .setTs(message_ts)
          .setText(
            `I've sent an invite to <@${userInvited.user_id}>`
          ).setTs(message_ts).save()

      execList.push([slack, inviteMessage])
      execList.push([slack, inviteNotification])
    }
  }

  const response = await exec.many(execList)
}
