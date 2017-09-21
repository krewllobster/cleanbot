const register = require('./register')
const unknown  = require('./unknown')
const createThrowdown = require('./createThrowdown')

module.exports = () => {
  return {
    register: (body) => register(body),
    unknown: (body) => unknown(body),
    'new throwdown': (body) => createThrowdown(body),
  }
}
