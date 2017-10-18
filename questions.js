require('dotenv').config()

const mongoose = require('mongoose')
const axios = require('axios')
const {Category, Throwdown, Question} = require('./app/models')

mongoose.Promise = global.Promise

const db = mongoose.connect(process.env.MONGO_URL, {
  useMongoClient: true
})

let tags = new Map()

const checkQuestions = async () => {
  const url = `http://www.quizbang.co.uk/cgi-bin/fetch.pl?command=questions&format=json`
  const {data: {questions}} = await axios.get(url)

  questions.forEach(q => {
    q.tags.forEach(t => {
      if (tags.has(t.text)) {
        tags.set(t.text, tags.get(t.text) + 1)
      } else {
        tags.set(t.text, 1)
      }
    })
  })

  console.log(tags.size)
  console.log(tags.sort())

  process.exit()

}

checkQuestions()
