module.exports = async (body, deps) => {
  const { name, team_id, channel_id, user_name, user_id, trigger_id } = body;
  const { slack, dbInterface, commandFactory, exec } = deps;

  const findThrowdown = commandFactory('db')
    .setEntity('Throwdown')
    .setOperation('findOne')
    .setMatch({ channel: channel_id })
    .save();

  const throwdown = await exec.one(dbInterface, findThrowdown);

  if (!throwdown) {
    const incorrectChannel = commandfactory('slack')
      .setOperation('ephemeralMessage')
      .setChannel(channel_id)
      .setUser(user_id)
      .setText(`This channel is not associated with a Throwdown. Sorry!`)
      .save();

    return await exec.one(slack, incorrectChannel);
  }

  const leaderboardLink = commandFactory('slack')
    .setOperation('ephemeralMessage')
    .setChannel(channel_id)
    .setUser(user_id)
    .setText(
      `Click this link to see your leaderboard as of right now!\n${process.env
        .SLACK_REDIRECT}/leaderboards/${throwdown._id}`
    )
    .save();

  await exec.one(slack, leaderboardLink);
};
