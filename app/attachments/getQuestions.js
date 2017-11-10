module.exports = (throwdown, user) => {
  const {questions, round} = throwdown

  return [
    {
      text: `Click below to get the questions for round ${round}!`,
      callback_id: 'send_question_list',
      actions: [{
        name: 'Get Questions',
        text: `Get my round ${round} questions!`,
        value: JSON.stringify({
          throwdown_id: throwdown._id,
          user,
          round,
        }),
        type: 'button'
      }]
    }
  ]
}
