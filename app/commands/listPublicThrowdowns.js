const processingMessage  = require('../common').processing
const {single_throwdown} = require('../messages')

module.exports = async (body, deps) => {
  const {slack, dbInterface, commandFactory, exec, user} = deps
  const {name, team_id, user_name, user_id, channel_id} = body

  const processing = processingMessage(deps, {
    text: 'Fetching list of public Throwdowns',
    user_id
  })

  const {channel} = await processing.next().value
  const {ts} = await processing.next(channel).value

  const findAllThrowdowns =
    commandFactory('db').setEntity('Throwdown').setOperation('find')
      .setMatch({team_id, privacy: 'public'}).setPopulate([
        {path: 'created_by', model: 'User'}, {path: 'participants', model: 'User'},
        {path: 'invitees', model: 'User'}, {path: 'categories', model: 'Category'}
      ]).save()

  const throwdowns = await exec.one(dbInterface, findAllThrowdowns)
  const attachments = throwdowns.map(throwdown => {
    return single_throwdown({throwdown, user_id, public: true})
  })
  const messageWithList =
    commandFactory('slack').setOperation('updateMessage')
      .setTs(ts).setChannel(channel.id).setText('Public Throwdowns')
      .setAttachments(attachments).save()

  if (attachments.length < 1) {
    messageWithList.text = `It looks like there aren't any public Throwdowns yet!`
  }

  const response = await exec.one(slack, messageWithList)
}
