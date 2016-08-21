'use strict';

var TestRunner = require('../../../');
var runner = new TestRunner({ manualStart: true, log: function log() {} });

runner.test('pass', function () {
  return 'ok';
});

runner.test('fail', function () {
  throw new Error('failed');
});

module.exports = runner;