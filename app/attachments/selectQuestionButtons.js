module.exports = (throwdown, user, round) => {
  const {questions} = throwdown

  const userResponses = throwdown.responses.filter(r => r.user.toString() === user._id.toString())

  const actions = questions
    //only look at this round's questions
    .filter(q => q.round === round)
    //filter out questions where user has already responded
    .filter(q => !userResponses.some(r => r.question._id.toString() === q.question._id.toString()))
    .map(q => {
      return {
        name: q.question.difficulty,
        text: `Round ${q.round}: ${q.question.difficulty}`,
        value: JSON.stringify({
          throwdown_id: throwdown._id,
          channel: throwdown.channel,
          question: q.question,
          round: round,
        }),
        type: 'button'
      }
    })

  const text = actions.length > 0
    ? `Here are your remaining questions for round ${round}`
    : ''
  return [
    {
      text,
      callback_id: 'send_question',
      actions
    }
  ]
}
