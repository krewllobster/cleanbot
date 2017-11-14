require('dotenv').config()

const mongoose = require('mongoose')
const axios = require('axios')
const {Category, Throwdown, Question} = require('./app/models')

mongoose.Promise = global.Promise

const db = mongoose.connect(process.env.MONGO_URL, {
  useMongoClient: true
})

const testAggregations = async () => {

  const throwdown = await Throwdown.findOne({name: '371'}).populate('responses')

  console.log(throwdown)


  process.exit(0)
}

testAggregations()
