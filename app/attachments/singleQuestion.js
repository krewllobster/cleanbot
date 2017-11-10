

module.exports = ({throwdown_id, question, channel, round}) => {

  let actions = []

  question.answers.forEach(a => {
    actions.push({
      name: a.text,
      text: a.text,
      value: JSON.stringify({
        throwdown_id,
        channel,
        round,
        question,
        correct: a.correct,
        requested: new Date(),
      }),
      type: 'button'
    })
  })

  return [{
    text: `Question: ${question.text}`,
    callback_id: 'check_answer',
    fallback: 'You have a new question to answer',
    actions
  }]
}
