const delete_throwdown = require('./delete_throwdown')
const join_throwdown = require('./join_throwdown')
const leave_throwdown = require('./leave_throwdown')


module.exports = (res) => ({
  delete_throwdown: (ids) => delete_throwdown(ids, res),
  join_throwdown: (ids) => join_throwdown(ids, res),
  leave_throwdown: (ids) => leave_throwdown(ids, res),
})
