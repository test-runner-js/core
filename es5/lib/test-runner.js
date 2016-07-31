'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var ansi = require('ansi-escape-sequences');

module.exports = test;

var tests = new Map();
var only = [];
var suiteFailed = false;

function test(name, testFunction) {
  if (beforeExitEventExists()) {
    tests.set(name, testFunction);
  } else {
    runTest(name, testFunction);
    if (suiteFailed) {
      process.nextTick(function () {
        return process.exit(1);
      });
    }
  }
}

test.skip = function () {};
test.only = function (name, testFunction) {
  test(name, testFunction);
  only.push(name);
};

function runTest(name, testFunction) {
  var t = require('typical');
  if (only.length && !only.includes(name)) return;
  var result = void 0;
  try {
    result = testFunction();
    if (t.isPromise(result)) {
      result.then(function (output) {
        return printOk(name, output);
      }).catch(function (err) {
        return printFail(name, err);
      });
    } else {
      printOk(name, result);
    }
  } catch (err) {
    printFail(name, err);
  }
}

process.on('beforeExit', function () {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tests[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2);

      var name = _step$value[0];
      var testFunction = _step$value[1];

      runTest(name, testFunction);
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

  if (suiteFailed) process.exitCode = 1;
});

function printOk(name, msg) {
  console.log(ansi.format(name, 'green') + ': ' + (msg || 'ok'));
  tests.delete(name);
}

function printFail(name, err) {
  suiteFailed = true;
  var msg = void 0;
  if (err) {
    msg = err.stack || err;
  } else {
    msg = 'failed';
  }
  console.log(ansi.format(name, 'red') + ': ' + msg);
  tests.delete(name);
}

function beforeExitEventExists() {
  var version = process.version.replace('v', '').split('.');
  return version[0] > 0 || version[0] === 0 && version[1] >= 11 && version[2] >= 12;
}