module.exports = async (deps, data) => {
  const { slack, dbInterface, commandFactory, exec } = deps;
  const { user_id, team_id } = data;

  const findSlackUser = commandFactory('slack')
    .setOperation('userInfo')
    .setUser(user_id)
    .save();

  const slackUser = await exec.one(slack, findSlackUser);

  const {
    id,
    team_id: teamId,
    name,
    tz_label,
    tz_offset,
    is_admin,
    profile
  } = slackUser.user;

  const matchFields = { user_id, team_id: teamId };
  const updateFields = {
    user_name: name,
    tz_label,
    tz_offset,
    is_admin,
    display_name: profile.display_name
  };

  const upsertUser = commandFactory('db')
    .setOperation('findOneAndUpdate')
    .setEntity('User')
    .setMatch(matchFields)
    .setUpdate(updateFields)
    .setOptions({ new: true, upsert: true })
    .save();

  const upsertedUser = await exec.one(dbInterface, upsertUser);

  return upsertedUser;
};
