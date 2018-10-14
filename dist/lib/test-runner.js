(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.TestRunner = factory());
}(this, (function () { 'use strict';

  class Test {
    constructor (name, testFn, options) {
      this.name = name;
      this.testFn = testFn;
      this.index = 1;
      this.options = Object.assign({ timeout: 10000 }, options);
    }
    
    run () {
      const testFnResult = new Promise((resolve, reject) => {
        try {
          const result = this.testFn.call({
            name: this.name,
            index: this.index++
          });
          if (result && result.then) {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (err) {
          reject(err);
        }
      });

      const timeoutResult = new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => {
            const err = new Error(`Timeout exceeded [${this.options.timeout}ms]`);
            reject(err);
          },
          this.options.timeout
        );
        if (timeout.unref) timeout.unref();
      });

      return Promise.race([ testFnResult, timeoutResult ])
    }
  }

  class TestRunner {
    constructor () {
      this.tests = [];
    }

    test (name, testFn, options) {
      this.tests.push(new Test(name, testFn, options));
    }

    run () {
      return Promise.all(this.tests.map(test => test.run()))
    }
  }

  return TestRunner;

})));
