const { singleQuestion } = require('../attachments');
const { findFullThrowdown, shuffle } = require('../common');
const sendBonus = require('./send_bonus');

module.exports = async (payload, action, deps) => {
  console.log('sending questions');
  const {
    user: { id: user_id },
    team: { id: team_id },
    message_ts,
    channel: { id: channel_id },
    original_message
  } = payload;

  const { bonus, round, question, throwdown_id } = JSON.parse(action.value);

  if (bonus) {
    return await sendBonus(payload, action, deps);
  }

  const { slack, dbInterface, commandFactory, exec, user } = deps;

  //get responses for this question
  const getResponses = commandFactory('db')
    .setEntity('Response')
    .setOperation('find')
    .setMatch({ user: user._id })
    .save();

  const getUserData = commandFactory('db')
    .setEntity('UserData')
    .setOperation('findOne')
    .setMatch({ throwdown: throwdown_id, round, user: user._id })
    .save();

  const [allResponses, thisUserData] = await exec.many([
    [dbInterface, getResponses],
    [dbInterface, getUserData]
  ]);

  const thisRoundResponses = allResponses.filter(
    r => r.round == round && r.throwdown == throwdown_id
  );
  //existing response is a response from this round, this throwdown, and not a bonus
  let existingResponse = allResponses.find(r => {
    return (
      r.round == round &&
      r.throwdown == throwdown_id &&
      !r.bonus &&
      r.question == question._id
    );
  });

  let hasResponse = existingResponse ? true : false;

  const newQuestion = singleQuestion({
    throwdown_id,
    round,
    question,
    channel: channel_id
  });

  const sendQuestion = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setUser(user_id)
    .setChannel(channel_id)
    .setAttachments(hasResponse ? [] : newQuestion)
    .setText(hasResponse ? `You've already answered this!` : '')
    .save();

  exec.one(slack, sendQuestion);
};
