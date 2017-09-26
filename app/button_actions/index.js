const delete_throwdown = require('./delete_throwdown')
const join_throwdown = require('./join_throwdown')


module.exports = (res) => ({
  delete_throwdown: (ids) => delete_throwdown(ids, res),
  join_throwdown: (ids) => join_throwdown(ids, res)
})
