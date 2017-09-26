const register = require('./register')
const unknown  = require('./unknown')
const createThrowdown = require('./createThrowdown')
const listPublicThrowdowns = require('./listPublicThrowdowns')
const listUserThrowdowns = require('./listUserThrowdowns')

module.exports = () => {
  return {
    register: (body) => register(body),
    unknown: (body) => unknown(body),
    'new throwdown': (body) => createThrowdown(body),
    'list throwdowns': (body) => listPublicThrowdowns(body),
    'all throwdowns': (body) => listPublicThrowdowns(body),
    'my throwdowns': (body) => listUserThrowdowns(body),
  }
}
