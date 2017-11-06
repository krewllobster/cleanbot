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

  let responseMessage, throwdown

  if (created) {
    throwdown = await findFullThrowdown(deps, {matchFields: {_id: doc._id}})
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

  initChannel(throwdown, deps)
}

const initChannel = async (throwdown, deps) => {
  const {slack, dbInterface, commandFactory, exec, user} = deps
  const name = throwdown.name.split(' ').join('_')

  const createChannel = commandFactory('slack').setOperation('createConversation')
    .set({name, private: true}).setClient('userClient').save()

  const {channel} = await exec.one(slack, createChannel)

  const setThrowdownChannel = commandFactory('db').setEntity('Throwdown')
    .setOperation('findOneAndUpdate').setMatch({_id: throwdown._id})
    .setUpdate({channel: channel.id}).save()

  const setChannelTopic = commandFactory('slack').setOperation('setTopic')
    .setChannel(channel.id).setTopic(throwdown.description)
    .setClient('userClient').save()

  const setChannelPurpose = commandFactory('slack').setOperation('setPurpose')
    .setChannel(channel.id).setPurpose(`<@${throwdown.created_by.user_id}>'s challenge`)
    .setClient('userClient').save()

  const responses = await exec.many([
    [dbInterface, setThrowdownChannel], [slack, setChannelTopic],
    [slack, setChannelPurpose]
  ])

  const getBotId = commandFactory('db').setEntity('Team').setOperation('findOne')
    .setMatch({team_id: throwdown.team_id}).save()

  const {bot: {bot_user_id}} = await exec.one(dbInterface, getBotId)

  const usersToInvite = bot_user_id + ',' + user.user_id

  const inviteBot = commandFactory('slack').setOperation('inviteToConversation')
    .setClient('userClient').setChannel(channel.id)
    .setUsers(usersToInvite).save()

  const response = await exec.one(slack, inviteBot)

  console.log(response)
}
