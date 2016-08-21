'use strict';

var TestRunner = require('../../');
var a = require('core-assert');
var path = require('path');

if (TestRunner.name === 'OldNodeTestRunner') {
  var runners = TestRunner.run(__dirname + '/fixture/*.js');
  a.strictEqual(runners[0].passed.length, 1);
  a.strictEqual(runners[0].failed.length, 1);
  a.strictEqual(runners[1].passed.length, 1);
  a.strictEqual(runners[1].failed.length, 1);
  a.strictEqual(runners.length, 2);
  process.exit(0);
} else {
  (function () {
    var runners = TestRunner.run(__dirname + '/fixture/*.js');
    var done = [];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = runners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var runner = _step.value;

        runner.on('start', function () {
          done.push('start');
        });

        runner.on('end', function () {
          a.strictEqual(this.passed.length, 1);
          a.strictEqual(this.failed.length, 1);
          done.push('end');
        });
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    Promise.all(runners.map(function (runner) {
      return runner.start();
    })).then(function (results) {
      a.strictEqual(process.exitCode, 1);
      a.deepEqual(done, ['start', 'start', 'end', 'end']);
      process.exitCode = 0;
    }).catch(function (err) {
      process.exitCode = 1;
      console.error(err.stack);
    });
  })();
}