const {singleQuestion} = require('../attachments')

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

  const text = `Your ${question.difficulty} question for round ${round} is below. Your points will depend on how quickly and accurately you answer. Good luck!`
  const attachment = singleQuestion(JSON.parse(action.value))

  const sendQuestion = commandFactory('slack').setOperation('ephemeralMessage')
    .setUser(user_id).setChannel(channel).setText(text)
    .setAttachments(attachment).save()

  exec.one(slack, sendQuestion)
}
