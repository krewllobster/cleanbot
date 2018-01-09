const { brandColor } = require('../constants');
const questionRoundButton = require('./questionRoundButton');
const singleQuestion = require('./singleQuestion');

module.exports = async (throwdown_id, round, deps) => {
  console.log('selecting next questions');
  console.log('for round ', round);
  const { slack, dbInterface, commandFactory, exec, user } = deps;

  //ALL responses belonging to user
  const getResponses = commandFactory('db')
    .setEntity('Response')
    .setOperation('find')
    .setMatch({ user: user._id })
    .setPopulate('question')
    .save();

  //questions belonging to throwdown
  const getQuestions = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('findOne')
    .setMatch({ _id: throwdown_id })
    .setPopulate([{ path: 'questions.question', model: 'Question' }])
    .save();

  //userData belonging to user from this throwdown
  const getUserData = commandFactory('db')
    .setEntity('UserData')
    .setOperation('find')
    .setMatch({
      user: user._id
    })
    .save();

  const [responses, throwdown, userData] = await exec.many([
    [dbInterface, getResponses],
    [dbInterface, getQuestions],
    [dbInterface, getUserData]
  ]);

  //user's responses to THIS throwdown
  const questionResponses = responses.filter(
    r => !r.bonus && r.throwdown == throwdown_id
  );
  //user's responses to ALL bonus questions asked
  const allBonusResponses = responses.filter(r => r.bonus);
  //user's responses to bonus questions THIS throwdown
  const tdBonusResponses = responses.filter(r => {
    return r.bonus && r.throwdown == throwdown_id;
  });
  const roundBonusResponses = tdBonusResponses.filter(r => r.round == round);
  const tdUserData = userData.filter(u => {
    return u.throwdown.toString() == throwdown_id;
  });
  const roundUserData = tdUserData.filter(u => u.round == round);
  //throwdown's questions that have NOT been answered by user
  //i.e. filter for question.round == this.round && question.id not in questionResponses
  const questionResponseIds = questionResponses.map(q =>
    q.question._id.toString()
  );
  const roundQuestions = throwdown.questions.filter(q => q.round == round);
  const remainingRoundQuestions = roundQuestions.filter(q => {
    return !questionResponseIds.includes(q.question._id.toString());
  });

  const bonusAnsweredThisRound = [...roundBonusResponses, ...roundUserData];

  console.log('bonus answered this round ________________');
  console.log(bonusAnsweredThisRound);

  let actions = [];

  //add any remaining questions to actions
  if (remainingRoundQuestions.length > 0) {
    remainingRoundQuestions.forEach(q => {
      actions.push({
        name: q.question.difficulty,
        text: `Round ${q.round}: ${q.question.difficulty}`,
        value: JSON.stringify({
          throwdown_id: throwdown_id,
          bonus: q.bonus || false,
          question: q.question,
          round: round
        }),
        type: 'button'
      });
    });
  }
  //if the user has not answered a bonus question this round
  //i.e. if user has no responses where throwdown == this.throwdown && round == this.round
  if (bonusAnsweredThisRound.length == 0) {
    console.log('no bonuses this round, send new bonus button');
    actions.push({
      name: 'bonus',
      text: `Round ${round} Bonus`,
      style: 'primary',
      type: 'button',
      value: JSON.stringify({
        throwdown_id: throwdown_id,
        bonus: true,
        question: null,
        round: round
      })
    });
  }
  //if there are questions left, send back message with remaining questions
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

  //if there are no quesitons left, count the responded questions for each round
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

  questionResponses.forEach(r => (roundTotals[r.round] += 1));
  allBonusResponses.forEach(r => (roundTotals[r.round] += 1));
  userData.forEach(u => (roundTotals[u.round] += 1));

  console.log('round totals');
  console.log(roundTotals);

  const roundButtons = [];

  Object.keys(roundTotals).forEach(r => {
    let total = roundTotals[r];
    if (total < 4 && r <= throwdown.round) {
      roundButtons.push(questionRoundButton(throwdown, user, { round: r }));
    }
  });

  console.log('round buttons');

  //if any unfinished rounds, send list of round buttons
  if (roundButtons && roundButtons.length > 0) {
    return [
      {
        color: brandColor,
        text: `You have some unfinished rounds -- do them while you're hot!`,
        callback_id: 'send_question_list',
        actions: roundButtons
      }
    ];
  }

  //otherwise send back a leaderboard message
  //TODO: this is where to send back a roundup. Can do based on responses
  return [
    {
      color: brandColor,
      text: `Nice. You've completed round ${round}.\nYou can find your leaderboard here: ${
        process.env.URL_BASE
      }/leaderboards/${throwdown_id}`
    }
  ];
};
