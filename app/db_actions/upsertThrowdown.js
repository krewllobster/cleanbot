const { Throwdown } = require('../models')

module.exports = (fieldsToMatch, fieldsToUpdate) => {
  return Throwdown.findOneAndUpdate(
    fieldsToMatch,
    fieldsToUpdate,
    {upsert: true, new: true}
  )
  .then(throwdown => {
    return throwdown
  })
  .catch(err => {
    return err
  })
}
