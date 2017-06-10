'use strict'
const TestRunner = require('../')

const runner = new TestRunner({ sequential: true, manualStart: true })

runner.test('one', function () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('planned fail 1'))
    }, 500)
  })
})

runner.test('two', function () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('planned fail 2'))
    }, 100)
  })
})

runner.start()
  .catch(err => {
    if (err.message === 'planned fail 1') {
      process.exitCode = 0
    }
  })
