const { User } = require('../models')

module.exports = ({user_id, team_id, question, answer}) => {
  let questionName = `profile.${question}`
  return User.findOneAndUpdate(
    {user_id, team_id},
    {$set:
      {[questionName]: answer}
    },
    {upsert: true, new: true}
  )
  .then(user => {
    console.log('user personal questions has been updated')
    return user
  })
  .catch(err => err)
}
