const {findFullThrowdown} = require('../common')
const {selectQuestionButtons} = require('../attachments')

module.exports = async (payload, action, deps) => {
  console.log('checking answers')
  console.log(payload)
  console.log(action)
  const {
    user: {id: user_id},
    team: {id: team_id},
    message_ts,
    channel: {id: channel_id},
    original_message,
  } = payload

  const {
    throwdown_id,
    channel,
    round,
    question,
    correct,
    requested
  } = JSON.parse(action.value)

  const { slack, dbInterface, commandFactory, exec, user } = deps

  const correctAnswer = question.answers.filter(a => {
    return a.correct
  })[0].text

  const submitted = new Date()
  const duration = ((new Date(submitted).getTime()) - (new Date(requested).getTime()))/1000
  console.log
  const updatedThrowdown = await findFullThrowdown(deps, {
    matchFields: {_id: throwdown_id},
    updateFields: {$push: {
      responses: {
        question: question._id,
        user: user._id,
        throwdown: throwdown_id,
        correct,
        requested,
        submitted,
      }
    }}
  })

  const replacementBase = commandFactory('slack').setOperation('ephemeralMessage')
    .setChannel(channel_id).setUser(user_id)

  let text

  if(correct) {
    text = `Congratulations! Your answer was correct, and took you ${duration} seconds.`
  } else if (!correct) {
    text = `Whoops! The correct answer was "${correctAnswer}". You took ${duration} seconds to guess wrong...`
  }

  const attachments = selectQuestionButtons(updatedThrowdown, user, round)

  const replacementMessage = replacementBase.setText(text)
    .setAttachments(attachments).save()

  exec.one(slack, replacementMessage)
}
