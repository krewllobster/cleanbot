const {
  commandFactory,
  dbInterface,
  slackApi,
  exec
} = require('../domains')

const { findFullThrowdown } = require('../common')
const { getQuestions } = require('../attachments')

module.exports = function (agenda) {
  agenda.define('send question buttons', async (job, done) => {
    console.log('starting send questions job')
    const {throwdown_id, team_id, user} = job.attrs.data

    const deps = {exec, commandFactory, dbInterface}

    const getKeys = commandFactory('db').setOperation('findOne')
      .setEntity('Team').setMatch({team_id}).save()

    const {
      access_token: user_token,
      bot: {bot_access_token: bot_token}
    } = await exec.one(dbInterface, getKeys)

    slack = slackApi({user_token, bot_token})

    deps.slack = slack

    const fullThrowdown = await findFullThrowdown(deps, {
      matchFields: {_id: throwdown_id},
      updateFields: {$inc: {round: 1}}
    })

    console.log('my channel is')
    console.log(fullThrowdown.channel)

    if (fullThrowdown.round > 10) {
      return done()
    }

    const sendQuestions = commandFactory('slack').setOperation('basicMessage')
      .setAttachments(getQuestions(fullThrowdown, user))
      .setChannel(fullThrowdown.channel)
      .save()

    const {ts} = await exec.one(slack, sendQuestions)

    const pinQuestions = commandFactory('slack').setOperation('addPin')
      .setChannel(fullThrowdown.channel).setTs(ts).save()

    exec.one(slack, pinQuestions)

    console.log('questions sent')

    done()
  })
}
