require('dotenv').config()

const mongoose = require('mongoose')
const axios = require('axios')
const {Category, Throwdown} = require('./app/models')

mongoose.Promise = global.Promise

const db = mongoose.connect(process.env.MONGO_URL, {
  useMongoClient: true
})

// const categories = axios.get('https://opentdb.com/api_category.php')
//
// categories.then(({data: {trivia_categories: cats}}) => {
//   console.log(cats)
//   const categoryList = cats.map(c => {
//     let name = c.name.match(/^(Entertainment:\s|Science:\s)?(.+)/)[2]
//     console.log(name)
//     return {name, _id: c.id}
//   })
//   return Category.collection.insert(categoryList)
// })
// .then(response => {
//   console.log(response)
// })

Throwdown.findOne({name: '123'})
  .populate('created_by')
  .then(td => {
    console.log(td)
  })
