'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ansi = require('ansi-escape-sequences');
var EventEmitter = require('events').EventEmitter;
var from = require('core-js/library/fn/array/from');
var includes = require('core-js/library/fn/array/includes');
var Map = require('core-js/library/fn/map');
var Promise_ = typeof Promise === 'undefined' ? require('core-js/library/fn/promise') : Promise;

var _only = [];

var TestRunner = function (_EventEmitter) {
  _inherits(TestRunner, _EventEmitter);

  function TestRunner(options) {
    _classCallCheck(this, TestRunner);

    var _this = _possibleConstructorReturn(this, (TestRunner.__proto__ || Object.getPrototypeOf(TestRunner)).call(this));

    options = options || {};
    _this.sequential = options.sequential;
    _this.manualStart = options.manualStart;
    _this.tests = new Map();
    _this.passed = [];
    _this.noop = [];
    _this.failed = [];
    _this.suiteFailed = false;
    _this.index = 1;
    _this.log = options.log || console.log;

    _this._autoStarted = false;
    if (!options.manualStart) {
      process.setMaxListeners(Infinity);
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

      if (this.sequential) {
        var _ret = function () {
          var tests = from(_this2.tests);
          return {
            v: new Promise(function (resolve, reject) {
              var run = function run() {
                var testItem = tests.shift();

                var _testItem = _slicedToArray(testItem, 2),
                    name = _testItem[0],
                    testFunction = _testItem[1];

                var result = _this2.runTest(name, testFunction);
                if (!(result && result.then)) result = Promise.resolve(result);
                result.then(function () {
                  if (tests.length) {
                    run();
                  } else {
                    if (_this2.suiteFailed) process.exitCode = 1;
                    resolve();
                  }
                }).catch(function (err) {
                  if (_this2.suiteFailed) process.exitCode = 1;
                  reject(err);
                });
              };
              run();
            })
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      } else {
        var testResults = from(this.tests).map(function (testItem) {
          var _testItem2 = _slicedToArray(testItem, 2),
              name = _testItem2[0],
              testFunction = _testItem2[1];

          return _this2.runTest(name, testFunction);
        });
        var result = Promise_.all(testResults).then(function (results) {
          if (_this2.suiteFailed) process.exitCode = 1;
          _this2.emit('end');
          return results;
        }).catch(function (err) {
          if (_this2.suiteFailed) process.exitCode = 1;
          _this2.emit('end');
          throw err;
        });

        if (this.manualStart) {
          return result;
        } else {
          return result.catch(function () {});
        }
      }
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
    value: function skip() {
      return this;
    }
  }, {
    key: 'only',
    value: function only(name, testFunction) {
      this.test(name, testFunction);
      _only.push(name);
      return this;
    }
  }, {
    key: 'runTest',
    value: function runTest(name, testFunction) {
      var _this3 = this;

      if (_only.length && !includes(_only, name)) {
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
        if (result && result.then) {
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

module.exports = TestRunner;