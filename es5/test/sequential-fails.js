'use strict';

var TestRunner = require('../../');

var runner = new TestRunner({ sequential: true, manualStart: true });
var a = require('core-assert');

runner.test('one', function () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error('planned fail 1'));
    }, 500);
  });
});

runner.test('two', function () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error('planned fail 2'));
    }, 100);
  });
});

runner.start().catch(function (err) {
  if (err.message === 'planned fail 1') {
    process.exitCode = 0;
  }
});