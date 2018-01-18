// const mongoose = require('mongoose');
// const Agenda = require('agenda');

// const db = mongoose.connect(process.env.MONGO_URL, {
//   useMongoClient: true
// });

// console.log('initiating agenda');

// const agenda = new Agenda().mongo(db, 'jobs');

// require('./app/jobs').forEach(job => {
//   job(agenda);
// });

// agenda.on('ready', () => agenda.start());

// const graceful = () => {
//   console.log('stopping agenda processes');
//   agenda.stop(() => process.exit(0));
// };

// process.on('SIGTERM', graceful);
// process.on('SIGINT', graceful);

// module.exports = agenda;

////////////////////

const Agenda = require('agenda');
const Mongoose = require('mongoose');
Mongoose.Promise = global.Promise;

async function run() {
  const db = Mongoose.connect(process.env.MONGO_URL, {
    useMongoClient: true
  });

  const agenda = new Agenda().mongo(db, 'jobs');

  // Define a "job", an arbitrary function that agenda can execute
  require('./app/jobs').forEach(job => {
    job(agenda);
  });

  // Wait for agenda to connect. Should never fail since connection failures
  // should happen in the `await MongoClient.connect()` call.
  await new Promise(resolve => agenda.once('ready', resolve));

  // `start()` is how you tell agenda to start processing jobs. If you just
  // want to produce (AKA schedule) jobs then don't call `start()`
  agenda.start();
}

run().catch(error => {
  console.error(error);
  process.exit(-1);
});
