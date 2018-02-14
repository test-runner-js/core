'use strict'
const TestRunner = require('../')
const a = require('assert')

const runner = new TestRunner({ manualStart: true })

/* These tests need fixing */

runner.test("Promise which doesn't resolve: should timeout", function () {
  return new Promise((resolve, reject) => {
    /* tumbleweeds */
    /* no IO or callbacks added by this, node won't wait for it */
    /* which means the .start().then handler will never be fired as not all promises resolve */
  })
})

runner.test('Promise which resolves', function () {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 50)
  })
})

runner.start()
  .then(results => console.log("This should fire, but doesn't."))

process.on('beforeExit', () => {
  a.strictEqual(runner.passed.length, 1)
  a.strictEqual(runner.failed.length, 1)
})
