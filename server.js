//make .env accessible
require('dotenv').config()

//requires
const bodyParser      = require('body-parser')
const mongoose        = require('mongoose')
const express         = require('express')
const ejs             = require('ejs')
const storeCreate     = require('./store')
const Agenda          = require('agenda')
const { defineJobs }  = require('./app/utils')



//configure Mongoose
mongoose.Promise = global.Promise

//app setup
const app    = express()
const http   = require('http').Server(app)

////public folder for images, css, etc.
app.use(express.static(__dirname + '/public'))

////body parsing
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


//view engine
app.set('view engine', 'ejs')

//routes
require('./app/routes')(app)

//port for heroku
app.set('port', (process.env.PORT))

//start
http.listen(app.get('port'), () => {
  console.log('listening on port ' + app.get('port'))
})
