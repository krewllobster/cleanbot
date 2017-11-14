const {singleQuestion} = require('../attachments')
const {findFullThrowdown} = require('../common')

module.exports = async (payload, action, deps) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id},
    original_message,
  } = payload

  const {
    channel,
    round,
    question,
    throwdown_id
  } = JSON.parse(action.value)

  const { slack, dbInterface, commandFactory, exec, user } = deps

  const fullThrowdown = await findFullThrowdown(deps, {
    matchFields: {_id: throwdown_id}
  })

  const hasResponse = fullThrowdown.responses
    .filter(r => r.user.toString() === user._id.toString())
    .some(r => r.question._id.toString() === question._id.toString())

  const attachment = singleQuestion(JSON.parse(action.value))

  const sendQuestion = commandFactory('slack').setOperation('ephemeralMessage')
    .setUser(user_id).setChannel(channel)
    .setAttachments(hasResponse ? [] : attachment)
    .setText(hasResponse ? `You've already answered this!` : '')
    .save()

  exec.one(slack, sendQuestion)
}
