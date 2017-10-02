const register = require('./register')
const unknown  = require('./unknown')
const createThrowdown = require('./createThrowdown')
const listPublicThrowdowns = require('./listPublicThrowdowns')
const listUserThrowdowns = require('./listUserThrowdowns')
const dialog = require('./dialog')
const newThrowdown = require('./createThrowdown')

module.exports = {
  new: newThrowdown,
  'new throwdown': newThrowdown,
  register,
}

//
// module.exports = () => {
//   return {
//     'asdf': newThrowdown,
//     'new throwdown': newThrowdown,
//     register,
//     unknown: (body) => unknown(body),
//     'new throwdown': (body) => createThrowdown(body),
//     'list throwdowns': (body) => listPublicThrowdowns(body),
//     'all throwdowns': (body) => listPublicThrowdowns(body),
//     'my throwdowns': (body) => listUserThrowdowns(body),
//     'dialog': (body) => dialog(body),
//   }
// }
