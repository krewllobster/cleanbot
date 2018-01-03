const { brandColor } = require('../constants');
const questionRoundButton = require('./questionRoundButton');

module.exports = async (throwdown_id, round, deps) => {
  console.log('selecting next questions');
  const { slack, dbInterface, commandFactory, exec, user } = deps;

  const getResponses = commandFactory('db')
    .setEntity('Response')
    .setOperation('find')
    .setMatch({
      throwdown: throwdown_id,
      user: user._id
    })
    .setPopulate('question')
    .save();

  const getQuestions = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('findOne')
    .setMatch({ _id: throwdown_id, 'questions.round': round })
    .setPopulate([{ path: 'questions.question', model: 'Question' }])
    .save();

  const getUserData = commandFactory('db')
    .setEntity('UserData')
    .setOperation('find')
    .setMatch({
      user_id: user.user_id,
      team_id: user.team_id,
      throwdown: throwdown_id
    })
    .save();

  const [responses, throwdown, userData] = await exec.many([
    [dbInterface, getResponses],
    [dbInterface, getQuestions],
    [dbInterface, getUserData]
  ]);
  const notBonus = q => !q.bonus;
  const isBonus = q => q.bonus;
  console.log('responses');
  console.log(responses);
  console.log('++++++filtered for bonus++++++++');
  console.log(responses.filter(isBonus));
  const answeredQuestionIds = responses
    .filter(notBonus)
    .map(r => r.question._id.toString());

  const answeredCoworkerQuestions = responses.filter(isBonus);

  const relevantQuestions = throwdown.questions.filter(q => {
    return q.round.toString() == round;
  });

  let actions = relevantQuestions
    .filter(q => {
      return !answeredQuestionIds.includes(q.question._id.toString());
    })
    .map(q => {
      return {
        name: q.question.difficulty,
        text: `Round ${q.round}: ${q.question.difficulty}`,
        value: JSON.stringify({
          throwdown_id: throwdown_id,
          channel: throwdown.channel,
          bonus: false,
          question: q.question,
          round: round
        }),
        type: 'button'
      };
    });

  const alreadyBonusUserData = userData.find(u => {
    return u.round == round;
  });
  const alreadyBonusCoworkerQuestion = answeredCoworkerQuestions.find(r => {
    return r.round == round;
  });
  console.log('already bonus userdata');
  console.log(alreadyBonusUserData);
  console.log('already coworker question answer');
  console.log(alreadyBonusCoworkerQuestion);

  if (!alreadyBonusUserData && !alreadyBonusCoworkerQuestion) {
    actions.push({
      name: 'bonus',
      text: `Round ${round} Bonus`,
      style: 'primary',
      type: 'button',
      value: JSON.stringify({
        throwdown_id: throwdown_id,
        bonus: true,
        question: null,
        channel: throwdown.channel,
        round: round
      })
    });
  }

  if (actions.length > 0) {
    return [
      {
        color: brandColor,
        text: '',
        callback_id: 'send_question',
        actions
      }
    ];
  }

  const roundTotals = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
    '6': 0,
    '7': 0,
    '8': 0,
    '9': 0,
    '10': 0
  };

  responses.forEach(r => (roundTotals[r.round] += 1));
  userData.forEach(u => (roundTotals[u.round] += 1));

  const unfinishedRounds = Object.keys(roundTotals)
    .filter(k => k <= throwdown.round && roundTotals[k] < 4)
    .map(k => {
      return { round: k, count: roundTotals[k] };
    });

  const roundButtons = [];

  if (unfinishedRounds.length > 0) {
    unfinishedRounds.forEach(r => {
      roundButtons.push(
        questionRoundButton(throwdown, user, { round: r.round })
      );
    });
  }

  return [
    {
      color: brandColor,
      text: `You have some unfinished rounds -- do them while you're hot!`,
      callback_id: 'send_question_list',
      actions: roundButtons
    }
  ];
};
