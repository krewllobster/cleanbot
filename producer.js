require('dotenv').config();

const Agenda = require('agenda');
const mongoose = require('mongoose');

mongoose.Promise = Promise;

mongoose.connect(process.env.MONGO_URL, {
  useMongoClient: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

const agenda = new Agenda().mongo(db, 'jobs');

module.exports = agenda;

// async function run() {
//   // ES6 promises
//   mongoose.Promise = Promise;

//   // mongodb connection
//   mongoose.connect(process.env.MONGO_URL, {
//     useMongoClient: true,
//     promiseLibrary: global.Promise
//   });

//   var db = mongoose.connection;

//   // mongodb error
//   db.on('error', console.error.bind(console, 'connection error:'));

//   // mongodb connection open
//   await db.once('open', () => {
//     console.log(`Connected to Mongo at: ${new Date()}`);
//   });

//   const agenda = new Agenda().mongo(db, 'jobs');

//   // Wait for agenda to connect. Should never fail since connection failures
//   // should happen in the `await MongoClient.connect()` call.
//   await new Promise(resolve => agenda.once('ready', resolve));

//   // `start()` is how you tell agenda to start processing jobs. If you just
//   // want to produce (AKA schedule) jobs then don't call `start()`
//   return agenda;
// }

// module.exports = () =>
//   run().catch(error => {
//     console.error(error);
//     process.exit(-1);
//   });
