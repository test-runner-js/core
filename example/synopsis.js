'use strict'
const TestRunner = require('../')
const runner = new TestRunner()

runner.test('this will pass', function () {
  const thought = 'Nothing failing here.'
})

runner.test('this will also pass', function () {
  return Promise.resolve('Nothing failing here.')
})

runner.test('this will fail', function () {
  throw new Error('Definitely something wrong here.')
})

runner.test('this will also fail', function () {
  return Promise.reject('Definitely something wrong here.')
})
