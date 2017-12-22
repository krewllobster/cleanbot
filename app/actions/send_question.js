const { singleQuestion } = require('../attachments');
const { findFullThrowdown } = require('../common');
const sendBonus = require('./send_bonus');

module.exports = async (payload, action, deps) => {
  const {
    user: { id: user_id },
    team: { id: team_id },
    message_ts,
    channel: { id: channel_id },
    original_message
  } = payload;

  const { channel, bonus, round, question, throwdown_id } = JSON.parse(
    action.value
  );

  if (bonus) {
    console.log('sending bonus');
    return sendBonus(payload, action, deps);
  }

  const { slack, dbInterface, commandFactory, exec, user } = deps;

  const findResponse = commandFactory('db')
    .setEntity('Response')
    .setOperation('findOne')
    .setMatch({
      throwdown: throwdown_id,
      user: user._id,
      question: question._id
    })
    .save();

  const existingResponse = await exec.one(dbInterface, findResponse);

  let hasResponse = false;

  if (existingResponse) hasResponse = true;

  const newQuestion = singleQuestion({
    throwdown_id,
    round,
    question,
    channel
  });

  const sendQuestion = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setUser(user_id)
    .setChannel(channel)
    .setAttachments(hasResponse ? [] : newQuestion)
    .setText(hasResponse ? `You've already answered this!` : '')
    .save();

  exec.one(slack, sendQuestion);
};
