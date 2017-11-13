const agenda              = require('../../agenda')
const { singleThrowdown } = require('../attachments')
const {
  processing: processingMessage,
  findFullThrowdown,
  findRandom
}  = require('../common')



module.exports = async (payload, submission, deps) => {

  const {
    team: {id: team_id},
    user: {id: user_id},
    channel: {id: channel_id},
  } = payload

  const {name, description, category, privacy, start_date} = submission
  const {slack, dbInterface, commandFactory, exec, user} = deps

  const processing = processingMessage(deps, {
    text: 'Processing new Throwdown...',
    user_id,
  })

  const {channel} = await processing.next().value
  const {ts} = await processing.next(channel).value

  const errorHandle = (err) => {
    console.log(err)
    throw new Error('error creating throwdown::' + err)
  }

  const newThrowdown = {
    privacy,
    team_id,
    created_by: user._id,
    description,
    round: 0,
    start_date: new Date(start_date),
    participants: [user._id],
    categories: [category],
    invitees: []
  }

  //check name and send error message if problem found
  const errorBase = commandFactory('slack').setOperation('updateMessage')
    .setChannel(channel.id).setTs(ts)

  if(name) {
    const getGroupList = commandFactory('slack').setClient('userClient')
      .setOperation('getChannels').save()

    const channelName = name.split(' ').join('_')

    if(channelName.match(/[^(a-z|0-9|_|\-)]/) || channelName.length > 21) {
      console.log('throwdown title had invalid character or was too long')
      const invalidNameMessage = errorBase
        .setText('Invalid Throwdown Name. Please try again').save()

      return await exec.one(slack, invalidNameMessage)
    }

    const {groups} = await exec.one(slack, getGroupList)

    if(groups && groups.some(c => c.name === channelName)) {
      console.log('throwdown channel name was already taken')
      const nameTakenMessage = errorBase
        .setText('That name is already taken. Please try again!').save()

      return await exec.one(slack, nameTakenMessage)
    }
  }

  console.log('creating new throwdown in database')
  const findOrCreateThrowdown =
    commandFactory('db').setEntity('Throwdown').setOperation('findOrCreate')
    .setMatch({name}).setUpdate(newThrowdown).save()

  const {doc, created} =
    await exec.one(dbInterface, findOrCreateThrowdown)

  const newThrowdownMessage =
    commandFactory('slack').setOperation('updateMessage')
      .setChannel(channel.id).setTs(ts)

  let responseMessage, throwdown

  if(!created) {
    console.log('throwdown creation was unsuccessful')
    responseMessage =
      newThrowdownMessage.setText(`There was an error creating your Throwdown. Please try again`)
      .setAttachments([]).save()

    return await exec.one(slack, responseMessage)
  }

  console.log('throwdown successfully created')
  throwdown = await findFullThrowdown(deps, {matchFields: {_id: doc._id}})

  responseMessage = newThrowdownMessage.setText(
    `Congratulations, your Throwdown has been set up! \n ${
      throwdown.privacy === 'private'
        ? 'You can invite people using the invite button below.'
        : 'Your throwdown will now show up for anyone to join.'
    }`)
    .setAttachments([
      singleThrowdown(throwdown, user_id, false)
    ]).save()

  const sendResponse = await exec.one(slack, responseMessage)

  const [updatedThrowdown, result] = await Promise.all([
    initQuestions(throwdown, deps), initChannel(throwdown, deps)
  ])

  console.log('initiating recurring throwdown jobs')
  const questionsJob = agenda
    .create('send question buttons', {
      throwdown_id: updatedThrowdown._id,
      team_id: team_id,
      user,
    })

  questionsJob.repeatEvery('2 minutes')
  questionsJob.save()
}

const initChannel = async (throwdown, deps) => {
  console.log('initializing throwdown channel')
  return new Promise(async (resolve, reject) => {
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

    let usersToInvite = bot_user_id
    if(throwdown.created_by.user_id !== user.user_id) {
      usersToInvite += ',' + user.user_id
    }

    const inviteBot = commandFactory('slack').setOperation('inviteToConversation')
      .setClient('userClient').setChannel(channel.id)
      .setUsers(usersToInvite).save()

    const response = await exec.one(slack, inviteBot)

    resolve(response)
  })
}

const initQuestions = (throwdown, deps) => {
  console.log('initializing throwdown questions')
  const errorHandle = (err) => {
    console.log(err)
    throw new Error('error creating throwdown::' + err)
  }
  return new Promise(async (resolve, reject) => {
    const {slack, dbInterface, commandFactory, exec, user} = deps
    const categories = throwdown.categories.map(c => c._id)

    const getQuestions = commandFactory('db').setEntity('Question')
      .setOperation('find').setMatch({category: {$in: categories}}).save()

    const allQuestions = await exec.one(dbInterface, getQuestions)

    let easy = findRandom(allQuestions.filter(q => q.difficulty === 'easy'), 10)
    let medium = findRandom(allQuestions.filter(q => q.difficulty === 'medium'), 10)
    let hard = findRandom(allQuestions.filter(q => q.difficulty === 'hard'), 10)

    const total = easy.length + medium.length + hard.length
    console.log(total)
    if(total < 30) {
      console.log('fewer than 30 questions returned, fetching general questions')
      const getGeneral = commandFactory('db').setEntity('Question')
        .setOperation('find').setMatch({category: 9}).save()

      const extras = await exec.one(dbInterface, getGeneral)

      const easyExtra =
        findRandom(extras.filter(q => q.difficulty === 'easy'), 10-easy.length)
      const mediumExtra =
        findRandom(extras.filter(q => q.difficulty === 'medium'), 10-medium.length)
      const hardExtra =
        findRandom(extras.filter(q => q.difficulty === 'hard'), 10-hard.length)

      easy = [...easy, ...easyExtra]
      medium = [...medium, ...mediumExtra]
      hard = [...hard, ...hardExtra]
    }
    const filter = (q, i) => {
      return ({question: q._id, round: i + 1})
    }
    easyQuestions = easy.map(filter)
    medQuestions = medium.map(filter)
    hardQuestions = hard.map(filter)

    const questions = [...easyQuestions, ...medQuestions, ...hardQuestions]

    const updateThrowdown = commandFactory('db').setEntity('Throwdown')
      .setOperation('findOneAndUpdate').setMatch({_id: throwdown._id})
      .setUpdate({questions}).setOptions({new: true}).save()

    const updated = await exec.one(dbInterface, updateThrowdown)

    resolve(updated)
  })
}
