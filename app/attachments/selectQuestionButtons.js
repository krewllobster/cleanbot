module.exports = (throwdown, user, round) => {
  const {questions} = throwdown

  let actions = []

  questions.filter(q => q.round === round).forEach(q => {
    if(!throwdown.responses.some(r => {
        alreadyAsked = r.question._id === q.question._id
        alreadyAnswered = r.user === user._id
        return alreadyAsked && alreadyAnswered
      })
    ) {
      actions.push({
        name: q.question.difficulty,
        text: q.question.difficulty,
        value: JSON.stringify({
          throwdown_id: throwdown._id,
          channel: throwdown.channel,
          question: q.question,
          round: round,
        }),
        type: 'button'
      })
    }
  })

  return [
    {
      text: `Click a button below to get a question for round ${round}.`,
      callback_id: 'send_question',
      actions
    }
  ]
}
