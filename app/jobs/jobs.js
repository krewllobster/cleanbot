const mongoose  = require('mongoose')
const Agenda    = require('agenda')
const WebClient = require('@slack/client').WebClient
const { Throwdown, Team } = require('../models')

const db = mongoose.connect(process.env.MONGO_URL, {
  useMongoClient: true
})

const agenda = new Agenda().mongo(db, 'jobs')

agenda.define('open channel', async (job, done) => {
  const {throwdown_id} = job.attrs.data
  const td = await Throwdown.findOne({_id: throwdown_id}).populate('participants')
  const team = await Team.findOne({team_id: td.team_id})
  const users = td.participants.map(p => p.user_id).join(',')
  console.log('users')
  console.log(users)
  const token = team.bot.bot_access_token
  const web = new WebClient(token)
  const {channel} = await web.conversations.open({users})
  const messageResp = await web.chat.postMessage(channel.id, 'Welcome!')
  console.log(messageResp)
  done()
})

agenda.define('send questions', async (job, done) => {
  const {id, name, channel_id} = job.attrs.data
  const td = await Throwdown.findOne({_id: id})
  const team = await Team.findOne({team_id: td.team_id})
  const token = team.bot.bot_access_token
  const web = new WebClient(token)
  const response = await web.chat.postMessage(channel_id, `Hi again ${name}`)
  console.log(response)
  done()
})

agenda.on('ready', () => agenda.start())

const graceful = () => {
  console.log('stopping agenda processes')
  agenda.stop(() => process.exit(0))
}

process.on("SIGTERM", graceful)
process.on("SIGINT", graceful)

module.exports = agenda
