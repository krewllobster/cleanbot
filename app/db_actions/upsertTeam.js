const { Team } = require('../models')

module.exports = (body) => {
  return Team.findOneAndUpdate(
    {team_id: body.team_id},
    body,
    {upsert: true, new: true}
  )
  .then(team => {
    return team
  })
  .catch(err => {
    return err
  })
}
