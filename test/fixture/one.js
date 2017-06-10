'use strict'
const TestRunner = require('../../')
const runner = new TestRunner({ manualStart: true, log: function () {} })

runner.test('pass', function () {
  return 'ok'
})

runner.test('fail', function () {
  throw new Error('failed')
})

module.exports = runner
