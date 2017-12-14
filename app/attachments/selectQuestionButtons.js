module.exports = async (throwdown_id, round, deps) => {
  const { slack, dbInterface, commandFactory, exec, user } = deps;

  const getResponses = commandFactory('db')
    .setEntity('Response')
    .setOperation('find')
    .setMatch({
      throwdown: throwdown_id,
      user: user._id,
      round
    })
    .setPopulate('question')
    .save();

  const getQuestions = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('findOne')
    .setMatch({ _id: throwdown_id, 'questions.round': round })
    .setPopulate([{ path: 'questions.question', model: 'Question' }])
    .save();

  const [responses, throwdown] = await exec.many([
    [dbInterface, getResponses],
    [dbInterface, getQuestions]
  ]);

  const answeredQuestionIds = responses.map(r => r.question._id.toString());

  const actions = throwdown.questions
    .filter(q => q.round === round)
    .filter(q => !answeredQuestionIds.includes(q.question._id.toString()))
    .map(q => {
      return {
        name: q.question.difficulty,
        text: `Round ${q.round}: ${q.question.difficulty}`,
        value: JSON.stringify({
          throwdown_id: throwdown_id,
          channel: throwdown.channel,
          question: q.question,
          round: round
        }),
        type: 'button'
      };
    });

  actions.push({
    name: 'bonus',
    text: `Round ${round} Bonus`,
    style: 'primary',
    type: 'button',
    value: JSON.stringify({
      throwdown_id: throwdown_id,
      channel: throwdown.channel,
      question: {},
      round: round
    })
  });

  return [
    {
      text: '',
      callback_id: 'send_question',
      actions
    }
  ];
  // const actions = questions
  //   //only look at this round's questions
  //   .filter(q => q.round === round)
  //   //filter out questions where user has already responded
  //   .filter(q => !userResponses.some(r => r.question._id.toString() === q.question._id.toString()))
  //   .map(q => {
  //     return {
  //       name: q.question.difficulty,
  //       text: `Round ${q.round}: ${q.question.difficulty}`,
  //       value: JSON.stringify({
  //         throwdown_id: throwdown._id,
  //         channel: throwdown.channel,
  //         question: q.question,
  //         round: round,
  //       }),
  //       type: 'button'
  //     }
  //   })
  //
  // const text = actions.length > 0
  //   ? `Here are your remaining questions for round ${round}`
  //   : ''
  // return [
  //   {
  //     text,
  //     callback_id: 'send_question',
  //     actions
  //   }
  // ]
  // return []
};
