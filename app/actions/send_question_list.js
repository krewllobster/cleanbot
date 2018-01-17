const { selectQuestionButtons, genLeaderboard } = require('../attachments');
const { findFullThrowdown } = require('../common');

module.exports = async (payload, action, deps) => {
  const {
    user: { id: user_id },
    team: { id: team_id },
    message_ts,
    channel: { id: channel_id },
    original_message
  } = payload;

  const { throwdown_id, round } = JSON.parse(action.value);

  const { slack, dbInterface, commandFactory, exec, user } = deps;

  //prevent channel members that are not throwdown participants from getting questions.
  const getParticipants = commandFactory('db')
    .setOperation('findOne')
    .setEntity('Throwdown')
    .setMatch({ _id: throwdown_id })
    .setPopulate('created_by')
    .save();

  const { participants, created_by } = await exec.one(
    dbInterface,
    getParticipants
  );

  if (!participants.map(p => p.toString()).includes(user._id.toString())) {
    const sendAdminMessage = commandFactory('slack')
      .setOperation('ephemeralMessage')
      .setUser(user_id)
      .setChannel(channel_id)
      .setText(
        `You have access to this channel but are not a member of this Throwdown.\n\nTo join this throwdown, type "/rumble list" to see public throwdowns, or message <@${
          created_by.user_id
        }> to request an invite.`
      )
      .save();

    return await exec.one(slack, sendAdminMessage);
  }

  const questionsToAttach = await selectQuestionButtons(
    throwdown_id,
    round,
    deps
  );

  let questionButtonText = `
    Choose a difficulty below to get this round's questions. We'll start timing you when you select a difficulty, and stop the timer when you select an answer.
After you give an answer, you'll see this message again with your remaining questions.\nGood luck!!
  `;

  if (!questionsToAttach || questionsToAttach[0].actions.length === 0) {
    questionButtonText = `Look's like you've already answered all of the round ${round} questions!`;
  }

  const sendQuestions = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setChannel(channel_id)
    .setUser(user_id)
    .setAttachments(questionsToAttach)
    .setText(questionButtonText)
    .save();

  exec.one(slack, sendQuestions).catch(e => console.log(e));
};
