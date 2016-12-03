'use strict';

var TestRunner = require('../../');
var a = require('core-assert');

var runner = new TestRunner({ manualStart: true, log: function log() {} });

runner.test("Promise which doesn't resolve", function () {
  return new Promise(function (resolve, reject) {});
});

runner.test('Promise which resolves', function () {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, 50);
  });
});

runner.start().then(function (results) {
  return console.error(require('util').inspect(results, { depth: 3, colors: true }));
});

process.on('beforeExit', function () {
  a.strictEqual(runner.passed.length, 1);
  a.strictEqual(runner.failed.length, 1);
});