'use strict';

var TestRunner = require('../../../');
var runner = new TestRunner({ manualStart: true, log: function log() {} });

runner.test('pass2', function () {
  return 'ok';
});

runner.test('fail2', function () {
  throw new Error('failed');
});

module.exports = runner;