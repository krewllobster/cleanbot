const {selectQuestionButtons} = require('../attachments')
const { findFullThrowdown } = require('../common')


module.exports = async (payload, action, deps) => {
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id},
    original_message,
  } = payload

  const {
    throwdown_id,
    round,
  } = JSON.parse(action.value)

  const { slack, dbInterface, commandFactory, exec, user } = deps

  const fullThrowdown = await findFullThrowdown(deps, {
    matchFields: {_id: throwdown_id},
    updateFields: {$inc: {round: 1}}
  })

  const sendQuestions = commandFactory('slack').setOperation('ephemeralMessage')
    .setAttachments(selectQuestionButtons(fullThrowdown, user, round))
    .setChannel(fullThrowdown.channel).setUser(user_id)
    .save()

  exec.one(slack, sendQuestions)
}
