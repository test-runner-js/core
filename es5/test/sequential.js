'use strict';

var TestRunner = require('../../');
var runner = new TestRunner({ sequential: true });
var finished = [];
var a = require('core-assert');

runner.test('one', function () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      finished.push(1);
      resolve(1);
    }, 1000);
  });
});

runner.test('two', function () {
  a.deepStrictEqual(finished, [1]);
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      finished.push(2);
      resolve(2);
    }, 500);
  });
});

runner.test('three', function () {
  a.deepStrictEqual(finished, [1, 2]);
});