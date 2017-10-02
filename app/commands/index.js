const register = require('./register')
const unknown  = require('./unknown')
const createThrowdown = require('./createThrowdown')
const listPublicThrowdowns = require('./listPublicThrowdowns')
const listUserThrowdowns = require('./listUserThrowdowns')
const dialog = require('./dialog')

module.exports = () => {
  return {
    register,
    unknown: (body) => unknown(body),
    'new throwdown': (body) => createThrowdown(body),
    'list throwdowns': (body) => listPublicThrowdowns(body),
    'all throwdowns': (body) => listPublicThrowdowns(body),
    'my throwdowns': (body) => listUserThrowdowns(body),
    'dialog': (body) => dialog(body),
  }
}
