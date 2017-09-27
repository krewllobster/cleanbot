const delete_throwdown = require('./delete_throwdown')
const join_throwdown = require('./join_throwdown')
const leave_throwdown = require('./leave_throwdown')
const send_invite_list = require('./send_invite_list')


module.exports = (res) => ({
  delete_throwdown: (ids) => delete_throwdown(ids, res),
  join_throwdown: (ids) => join_throwdown(ids, res),
  leave_throwdown: (ids) => leave_throwdown(ids, res),
  send_invite_list: (ids) => send_invite_list(ids, res),
})
