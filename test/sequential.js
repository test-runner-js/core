'use strict'
const TestRunner = require('../')
const runner = new TestRunner({ sequential: true })
const finished = []
const a = require('assert')

runner.test('one', function () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      finished.push(1)
      resolve(1)
    }, 1000)
  })
})

runner.test('two', function () {
  a.deepStrictEqual(finished, [ 1 ])
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      finished.push(2)
      resolve(2)
    }, 500)
  })
})

runner.test('three', function () {
  a.deepStrictEqual(finished, [ 1, 2 ])
  finished.push(3)
})
