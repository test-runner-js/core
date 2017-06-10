'use strict'
const TestRunner = require('../')
const a = require('assert')

const runner = new TestRunner({ manualStart: true, log: () => {} })

runner.test("Promise which doesn't resolve", function () {
  return new Promise((resolve, reject) => {
    /* tumbleweeds */
    /* no IO or callbacks added by this, node won't wait for it */
    /* which means the .start().then handler will never be fired as not alway promises resolve */
  })
})

runner.test('Promise which resolves', function () {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 50)
  })
})

runner.start()
  .then(results => console.error(require('util').inspect(results, { depth: 3, colors: true })))

process.on('beforeExit', () => {
  a.strictEqual(runner.passed.length, 1)
  a.strictEqual(runner.failed.length, 1)
})
