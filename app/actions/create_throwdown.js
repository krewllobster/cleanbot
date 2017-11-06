const agenda              = require('../jobs/jobs')
const { singleThrowdown } = require('../attachments')
const {
  processing: processingMessage,
  findFullThrowdown
}  = require('../common')

module.exports = async (payload, submission, deps) => {

  const {
    team: {id: team_id},
    user: {id: user_id},
    channel: {id: channel_id},
  } = payload

  const {name, description, category, privacy, start_date} = submission
  const {slack, dbInterface, commandFactory, exec, user} = deps

  const errorHandle = (err) => {
    throw new Error('error creating throwdown::' + err)
  }

  const processing = processingMessage(deps, {
    text: 'Processing new Throwdown...',
    user_id,
  })

  const {channel} = await processing.next().value
  const {ts} = await processing.next(channel).value

  const newThrowdown = {
    privacy,
    team_id,
    created_by: user._id,
    description,
    start_date: new Date(start_date),
    participants: [user._id],
    categories: [category],
    invitees: []
  }

  const findOrCreateThrowdown =
    commandFactory('db').setEntity('Throwdown').setOperation('findOrCreate')
    .setMatch({name}).setUpdate(newThrowdown).save()

  const {doc, created} =
    await exec.one(dbInterface, findOrCreateThrowdown).catch(errorHandle)

  const newThrowdownMessage =
    commandFactory('slack').setOperation('updateMessage')
      .setChannel(channel.id).setTs(ts)

  let responseMessage

  if (created) {
    const throwdown = await findFullThrowdown(deps, {matchFields: {_id: doc._id}})
    // const channel_job = agenda.create('open channel', {throwdown_id: throwdown._id})
    // channel_job.schedule(new Date(throwdown.start_date))
    // channel_job.save()
    console.log(throwdown)
    responseMessage = newThrowdownMessage.setText(
      `Congratulations, your Throwdown has been set up! \n ${
        throwdown.privacy === 'private'
          ? 'You can invite people using the invite button below.'
          : 'Your throwdown will now show up for anyone to join.'
      }`)
      .setAttachments([
        singleThrowdown(throwdown, user_id, false)
      ]).save()
  }

  if(!created) {
    responseMessage =
      newThrowdownMessage.setText(`Look's like that name's taken. Please try again`)
      .setAttachments([]).save()
  }
  const sendResponse = await exec.one(slack, responseMessage).catch(errorHandle)
}
