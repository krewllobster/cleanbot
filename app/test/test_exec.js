const assert = require('assert')
const exec = require('../domains/exec')

describe('test exec function', () => {
  it('has two methods, one and many', () => {
    assert(typeof exec === 'object')
    assert(typeof exec.one === 'function')
    assert(typeof exec.many === 'function')
  })
})

const command = {
  testing: 'test'
}

const domain = {
  execute: (command) => {
    return new Promise((resolve) => {})
  }
}


describe('exec.one() function', () => {
  const result = exec.one(domain, command)
  it('returns a promise', () => {
    assert(typeof result === 'object')
    assert(typeof result.then === 'function')
  })
})

describe('exec.many()', (done) => {
  const results = exec.many([[domain, command], [domain, command]])
  it('returns a list of promises', () => {
    console.log(results)
    assert(typeof results === 'array')
    results.forEach(r => {
      assert(typeof r === 'object')
      assert(typeof r.then === 'function')
    })
  })
  done()
})
