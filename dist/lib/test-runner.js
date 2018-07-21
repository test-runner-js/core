(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.TestRunner = factory());
}(this, (function () { 'use strict';

  class Test {
    constructor (name, testFn) {
      this.name = name;
      this.testFn = testFn;
      this.index = 1;
    }
    run () {
      const result = this.testFn.call({
        name: this.name,
        index: this.index++
      });
      return result
    }
  }

  class TestRunner {
    constructor () {
      this.tests = [];
    }

    test (name, testFn) {
      this.tests.push(new Test(name, testFn));
    }

    run () {
      return this.tests.map(test => test.run())
    }
  }

  return TestRunner;

})));
