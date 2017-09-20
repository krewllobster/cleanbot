const { Category, Throwdown } = require('../models')

module.exports = ({_id}) => {
  const td = Throwdown.findOne({_id})
  const categories = Category.find({})

  return Promise.all([td, categories])
    .then(([td, categories]) => {
      const used = td.categories
      const catList = []
      categories.forEach(c => {
        if (!used.includes(c._id)) {
          catList.push({
            text: c.name,
            value: JSON.stringify({_id, category: c})
          })
        }
      })
      return catList
    })
    .then(catList => {
      return {
        title: `Choose a question category to add:`,
        callback_id: 'add_throwdown_category',
        attachment_type: 'default',
        actions: [
          {
            name: 'add_throwdown_category',
            text: 'select a category...',
            type: 'select',
            options: catList
          }
        ]
      }
    })
    .catch(err => {
      console.log('err fetching categories::' + err)
      return err
    })
}
