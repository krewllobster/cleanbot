const { Throwdown, User } = require('../models')

module.exports = async (matchFields) => {
  let participants

  const deletedThrowdown = await Throwdown.findOneAndRemove(matchFields)

  return deletedThrowdown
}
