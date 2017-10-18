const Agenda    = require('agenda')
const mongoose  = require('mongoose')

const db = mongoose.connect(process.env.MONGO_URL, {
  useMongoClient: true
})

const agenda = new Agenda().mongo(db, 'jobs')

module.exports = async (name, data) => {
  agenda.define(name, (job, done) => {
    console.log('JOB STARTING____________')
    console.log(job.attrs.data)
  })

  await new Promise(resolve => agenda.once('ready', resolve()))

  agenda.schedule(new Date(Date.now() + 5000), name, {data})
  agenda.start()
}


const singleJob = (job, done) => {
  console.log(job.attrs.data)
}
