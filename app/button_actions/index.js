const delete_throwdown = require('./delete_throwdown')


module.exports = (res) => ({
  delete_throwdown: (ids) => delete_throwdown(ids, res),
})
