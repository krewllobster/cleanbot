const { Throwdown } = require('../models')

module.exports = (matchFields) => {
  return Throwdown.findOne(matchFields)
    .populate('created_by')
    .populate('participants')
    .populate('invitees')
    .populate('categories')
    .exec()
    .then(throwdown => {
      return throwdown
    })
    .catch(err => {
      return err
    })
}
