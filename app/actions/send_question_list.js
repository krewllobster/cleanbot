const { selectQuestionButtons, genLeaderboard } = require('../attachments');

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

  const questionsToAttach = await selectQuestionButtons(throwdown_id, round, {
    responses,
    throwdown,
    userData,
    user
  });

  let questionButtonText = `
    Choose a difficulty below to get this round's questions. We'll start timing you when you select a difficulty, and stop the timer when you select an answer.
After you give an answer, you'll see this message again with your remaining questions.\nGood luck!!
  `;

  if (!questionsToAttach) {
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
