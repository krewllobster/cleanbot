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
