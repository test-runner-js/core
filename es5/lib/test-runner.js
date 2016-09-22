'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ansi = require('ansi-escape-sequences');
var EventEmitter = require('events').EventEmitter;
var t = require('typical');

var _only = [];

var TestRunner = function (_EventEmitter) {
  _inherits(TestRunner, _EventEmitter);

  function TestRunner(options) {
    _classCallCheck(this, TestRunner);

    var _this = _possibleConstructorReturn(this, (TestRunner.__proto__ || Object.getPrototypeOf(TestRunner)).call(this));

    options = options || {};
    _this.tests = new Map();
    _this.passed = [];
    _this.noop = [];
    _this.failed = [];
    _this.suiteFailed = false;
    _this.index = 1;
    _this.log = options.log || console.log;

    _this._autoStarted = false;
    if (!options.manualStart) {
      process.on('beforeExit', function () {
        if (!_this._autoStarted) {
          _this.start();
          _this._autoStarted = true;
        }
      });
    }
    return _this;
  }

  _createClass(TestRunner, [{
    key: 'start',
    value: function start() {
      var _this2 = this;

      this.emit('start');
      return Promise.all(Array.from(this.tests).map(function (testItem) {
        var _testItem = _slicedToArray(testItem, 2);

        var name = _testItem[0];
        var testFunction = _testItem[1];

        return _this2.runTest(name, testFunction);
      })).then(function (results) {
        if (_this2.suiteFailed) process.exitCode = 1;
        _this2.emit('end');
        return results;
      }).catch(function (err) {});
    }
  }, {
    key: 'test',
    value: function test(name, testFunction) {
      if (this.tests.has(name)) {
        console.error('Duplicate test name: ' + name);
        process.exit(1);
      }
      this.tests.set(name, testFunction);
      return this;
    }
  }, {
    key: 'skip',
    value: function skip() {}
  }, {
    key: 'only',
    value: function only(name, testFunction) {
      this.test(name, testFunction);
      _only.push(name);
    }
  }, {
    key: 'runTest',
    value: function runTest(name, testFunction) {
      var _this3 = this;

      if (_only.length && !_only.includes(name)) {
        return;
      } else if (!testFunction) {
        this.printNoOp(name);
        return;
      }

      var result = void 0;
      try {
        result = testFunction.call({
          name: name,
          index: this.index++
        });
        if (t.isPromise(result)) {
          result.then(function (output) {
            return _this3.printOk(name, output);
          }).catch(function (err) {
            return _this3.printFail(name, err);
          });
        } else {
          this.printOk(name, result);
        }
      } catch (err) {
        result = '__failed';
        this.printFail(name, err);
      }
      return result;
    }
  }, {
    key: 'printOk',
    value: function printOk(name, msg) {
      this.log(ansi.format(name, 'green') + ': ' + (msg || 'ok'));
      this.tests.delete(name);
      this.passed.push(name);
    }
  }, {
    key: 'printNoOp',
    value: function printNoOp(name, msg) {
      this.log(ansi.format(name, 'magenta') + ': ' + (msg || '--'));
      this.tests.delete(name);
      this.noop.push(name);
    }
  }, {
    key: 'printFail',
    value: function printFail(name, err) {
      this.suiteFailed = true;
      var msg = void 0;
      if (err) {
        msg = err.stack || err;
      } else {
        msg = 'failed';
      }
      this.log(ansi.format(name, 'red') + ': ' + msg);
      this.tests.delete(name);
      this.failed.push(name);
    }
  }], [{
    key: 'run',
    value: function run(globs) {
      var arrayify = require('array-back');
      globs = arrayify(globs);
      var FileSet = require('file-set');
      var path = require('path');
      var flatten = require('reduce-flatten');
      return globs.map(function (glob) {
        var fileSet = new FileSet(glob);
        return fileSet.files.map(function (file) {
          return require(path.resolve(process.cwd(), file));
        });
      }).reduce(flatten, []);
    }
  }]);

  return TestRunner;
}(EventEmitter);

var OldNodeTestRunner = function (_TestRunner) {
  _inherits(OldNodeTestRunner, _TestRunner);

  function OldNodeTestRunner() {
    _classCallCheck(this, OldNodeTestRunner);

    return _possibleConstructorReturn(this, (OldNodeTestRunner.__proto__ || Object.getPrototypeOf(OldNodeTestRunner)).apply(this, arguments));
  }

  _createClass(OldNodeTestRunner, [{
    key: 'test',
    value: function test(name, testFunction) {
      this.runTest(name, testFunction);
      if (this.suiteFailed) {
        process.nextTick(function () {
          return process.exit(1);
        });
      }
    }
  }]);

  return OldNodeTestRunner;
}(TestRunner);

function beforeExitEventExists() {
  var version = process.version.replace('v', '').split('.').map(Number);
  return version[0] > 0 || version[0] === 0 && version[1] >= 11 && version[2] >= 12;
}

if (beforeExitEventExists()) {
  module.exports = TestRunner;
} else {
  module.exports = OldNodeTestRunner;
}