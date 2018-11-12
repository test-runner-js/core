(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.TestRunner = factory());
}(this, (function () { 'use strict';

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
   * Make an object observable.
   * @module obso
   * @example
   * import Emitter from './node_modules/obso/emitter.mjs'
   *
   * class Something extends Emitter {}
   * const something = new Something()
   * something.on('load', () => {
   *   console.log('load event fired.')
   * })
   */

  /**
   * @alias module:obso
   */
  class Emitter {
    /**
     * Emit an event.
     * @param eventName {string} - the event name to emit
     * @param ...args {*} - args to pass to the event handler
     */
    emit (eventName, ...args) {
      if (this._listeners && this._listeners.length > 0) {
        const toRemove = [];
        this._listeners.forEach(listener => {
          if (listener.eventName === eventName) {
            listener.handler.apply(this, args);
          } else if (listener.eventName === '__ALL__') {
            const handlerArgs = args.slice();
            handlerArgs.unshift(eventName);
            listener.handler.apply(this, handlerArgs);
          }
          if (listener.once) toRemove.push(listener);
        });
        toRemove.forEach(listener => {
          this._listeners.splice(this._listeners.indexOf(listener), 1);
        });
      }
      if (this.parent) this.parent.emit(eventName, ...args);
    }

     /**
      * Register an event listener.
      * @param eventName {string} - the event name to watch
      * @param handler {function} - the event handler
      */
    on (eventName, handler, options) {
      createListenersArray(this);
      options = options || {};
      if (arguments.length === 1 && typeof eventName === 'function') {
        this._listeners.push({ eventName: '__ALL__', handler: eventName, once: options.once });
      } else {
        this._listeners.push({ eventName: eventName, handler: handler, once: options.once });
      }
    }

    /**
     * Remove an event listener.
     * @param eventName {string} - the event name
     * @param handler {function} - the event handler
     */
    removeEventListener (eventName, handler) {
      if (!this._listeners || this._listeners.length === 0) return
      const index = this._listeners.findIndex(function (listener) {
        return listener.eventName === eventName && listener.handler === handler
      });
      if (index > -1) this._listeners.splice(index, 1);
    }

    once (eventName, handler) {
      this.on(eventName, handler, { once: true });
    }

    propagate (eventName, from) {
      from.on(eventName, (...args) => this.emit(eventName, ...args));
    }
  }

  /* alias */
  Emitter.prototype.addEventListener = Emitter.prototype.on;

  function createListenersArray (target) {
    if (target._listeners) return
    Object.defineProperty(target, '_listeners', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: []
    });
  }

  /**
   * @module test-runner
   */

  /**
   * @alias module:test-runner
   */
  class TestRunner extends Emitter {
    constructor () {
      super();
      this._id = 1;
      this.tests = [];
      this.on('start', count => console.log(`1..${count}`));
      this.on('test-pass', test => console.log(`ok ${test.id} ${test.name}`));
      this.on('test-fail', test => console.log(`not ok ${test.id} ${test.name}`));
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
