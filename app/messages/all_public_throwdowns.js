const {Throwdown} = require('../models')
const single_throwdown = require('./single_throwdown')

module.exports = async ({user_id, team_id}) => {

  const throwdownList = await Throwdown.find({team_id})
    .populate('created_by')
    .populate('participants')
    .populate('categories')
    .populate('invitees')
    .exec()

  let attachments = []

  throwdownList.forEach(throwdown => {
    if(throwdown.privacy === 'public') {
      attachments.push(single_throwdown({throwdown, user_id, public: true}))
    }
  })

  return attachments
}
