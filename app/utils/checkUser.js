const { User } = require('../models')
const to = require('./to')

module.exports = async ({user_id, team_id}, botClient) => {
  const [err, user] = await to(User.findOne({user_id, team_id}))

  if (err) throw err

  if (!user) {
    const [err2, userInfo] = await to(botClient.users.info(user_id))

    if (err2) throw err2

    const {id, team_id, name, tz_label, tz_offset, is_admin} = userInfo.user

    const [err3, newUser] = await to(User.create({
      user_id: id,
      team_id,
      user_name: name,
      tz_label,
      tz_offset,
      is_admin
    }))

    if (err3) throw err3

    return newUser
  } else if (user) {
    return user
  }
}
