(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('events')) :
  typeof define === 'function' && define.amd ? define(['events'], factory) :
  (global.TestRunner = factory(global.events));
}(this, (function (events) { 'use strict';

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
              this.emit('test-pass', test);
              this.emit('test-end', test);
              return result
            })
            .catch(err => {
              this.emit('test-fail', test);
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

  return TestRunner;

})));
