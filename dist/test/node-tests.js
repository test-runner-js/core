'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var events = require('events');
var a = _interopDefault(require('assert'));

function raceTimeout (ms, msg) {
  return new Promise((resolve, reject) => {
    const interval = setTimeout(() => {
      const err = new Error(msg || `Timeout expired [${ms}]`);
      reject(err);
    }, ms);
    if (interval.unref) interval.unref();
  })
}

/**
 * Test function class.
 * @param {string} name
 * @param {function} testFn
 * @param {object} options
 * @param {number} options.timeout
 */
class Test {
  constructor (name, testFn, options) {
    this.name = name;
    this.testFn = testFn;
    this.id = 1;
    this.options = Object.assign({ timeout: 10000 }, options);
  }

  /**
   * Execute the stored test function.
   * @returns {Promise}
   */
  run () {
    const testFnResult = new Promise((resolve, reject) => {
      try {
        const result = this.testFn.call(new TestContext({
          name: this.name,
          id: this.id
        }));
        if (result && result.then) {
          result.then(resolve).catch(reject);
        } else {
          resolve(result);
        }
      } catch (err) {
        reject(err);
      }
    });

    return Promise.race([ testFnResult, raceTimeout(this.options.timeout) ])
  }
}

/**
 * The test context, available as `this` within each test function.
 */
class TestContext {
  constructor (context) {
    this.name = context.name;
    this.id = context.id;
  }
}

/**
 * @module test-runner
 */

/**
 * @alias module:test-runner
 */
class TestRunner extends events.EventEmitter {
  constructor () {
    super();
    this._id = 1;
    this.tests = [];
  }

  test (name, testFn, options) {
    const t = new Test(name, testFn, options);
    t.id = this._id++;
    this.tests.push(t);
  }

  /**
   * Run all tests in parallel
   */
  start () {
    this.emit('start', this.tests.length);
    return Promise
      .all(this.tests.map(test => {
        this.emit('test-start', test);
        return test.run()
          .then(result => {
            this.emit('test-end', test);
            return result
          })
          .catch(err => {
            this.emit('test-end', test);
            throw err
          })
      }))
      .then(results => {
        this.emit('end');
        return results
      })
      .catch(err => {
        process.exitCode = 1;
        this.emit('end');
        throw err
      })
  }
}

const tests$2 = [];

tests$2.push(function (assert) {
  const runner = new TestRunner('runner.start: load test');
  let i = 0;
  while (i++ < 100000) {
    runner.test(`test ${i}`, function () {
      return i
    });
  }
  return runner.start()
    // .then(results => {
    //   assert(results[0] === true)
    //   assert(results[1] === 1)
    // })
});

function testSuite$2 (assert) {
  return Promise.all(tests$2.map(t => t(assert)))
}

// testSuite(a.ok)
//   .then(function () {
//     return testRunnerSuite(a.ok)
//   })
//   .then(function () {
//     console.log('Done.')
//   })
//   .catch(function (err) {
//     process.exitCode = 1
//     console.error(err)
//   })

testSuite$2(a.ok)
  .then(function () {
    console.log('Done.');
  })
  .catch(function (err) {
    process.exitCode = 1;
    console.error(err);
  });
