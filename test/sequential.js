'use strict'
const TestRunner = require('../')
const runner = new TestRunner({ sequential: true })
const finished = []
const a = require('assert')

runner.test('sequential: one', function () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      finished.push(1)
      resolve(1)
    }, 1000)
  })
})

runner.test('sequential: two', function () {
  a.deepStrictEqual(finished, [ 1 ])
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      finished.push(2)
      resolve(2)
    }, 500)
  })
})

runner.test('sequential: three', function () {
  a.deepStrictEqual(finished, [ 1, 2 ])
})
