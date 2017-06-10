'use strict'
const TestRunner = require('../../')
const runner = new TestRunner({ manualStart: true, log: function () {} })

runner.test('pass2', function () {
  return 'ok'
})

runner.test('fail2', function () {
  throw new Error('failed')
})

module.exports = runner
