/**
 * @module emitter
 * @example
 * import Emitter from './node_modules/emitter/emitter.js'
 *
 * class Something extends Emitter {}
 * const something = new Something()
 * something.on('load', () => {
 *   console.log('load event fired.')
 * })
 */

/**
 * @alias module:emitter
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

const only = [];

class TestRunner extends Emitter {
  constructor (options) {
    super();
    options = options || {};
    this.sequential = options.sequential;
    this.tests = new Map();
    this.passed = [];
    this.noop = [];
    this.failed = [];
    this.suiteFailed = false;
    this.index = 1;

    this.on('pass', (name, msg) => {
      console.log('✅', name, msg);
    });
    this.on('fail', (name, err) => {
      console.error('🛑', name, err.stack, err);
    });
  }

  /**
   * Begin testing. You'll only need to use this method when `manualStart` is `true`.
   * @returns {Promise}
   * @fulfil {Array} - Resolves with an array containing the return value of each test.
   */
  start () {
    this.emit('start');

    /* sequential */
    if (this.sequential) {
      const tests = Array.from(this.tests);
      return new Promise((resolve, reject) => {
        const run = () => {
          const testItem = tests.shift();
          const name = testItem[0];
          const testFunction = testItem[1];
          let result = this.runTest(name, testFunction);
          if (!(result && result.then)) result = Promise.resolve(result);
          result
            .then(() => {
              if (tests.length) {
                run();
              } else {
                // if (this.suiteFailed) process.exitCode = 1
                resolve();
              }
            })
            .catch(err => {
              // if (this.suiteFailed) process.exitCode = 1
              reject(err);
            });
        };
        run();
      })

    /* parallel */
    } else {
      const testResults = Array.from(this.tests).map(testItem => {
        const name = testItem[0];
        const testFunction = testItem[1];
        return this.runTest(name, testFunction)
      });
      const result = Promise
        .all(testResults)
        .then(results => {
          // if (this.suiteFailed) process.exitCode = 1
          this.emit('end');
          return results
        })
        .catch(err => {
          // if (this.suiteFailed) process.exitCode = 1
          this.emit('end');
          throw err
        });

      return result
    }
  }

  /**
   * Register a test.
   * @param {string} - Each name supplied must be unique to the runner instance.
   * @param {function} - The test function. If it throws or rejects, the test will fail.
   * @chainable
   */
  test (name, testFunction) {
    if (this.tests.has(name)) {
      throw new Error('Duplicate test name: ' + name)
    } else if (!name) {
      throw new Error('Every test must have a name')
    }
    this.tests.set(name, testFunction);
    return this
  }

  /**
   * No-op. Use this method when you want a test to be skipped.
   * @chainable
   */
  skip (name) {
    this.printNoOp(name);
    return this
  }

  /**
   * Only run this and other tests registered with `only`.
   * @param {string}
   * @param {function}
   * @chainable
   */
  only (name, testFunction) {
    this.test(name, testFunction);
    only.push(name);
    return this
  }

  /**
   * Run test, returning the result which may be a Promise.
   * @param {string}
   * @param {function}
   * @returns {*}
   * @ignore
   */
  runTest (name, testFunction) {
    /* runner.only */
    if (only.length && !only.includes(name)) {
      return

    /* placeholder test */
    } else if (!testFunction) {
      this.printNoOp(name);
      return
    }

    let result;
    try {
      result = testFunction.call({
        name: name,
        index: this.index++
      });
      if (result && result.then) {
        result
          .then(output => this.printOk(name, output))
          .catch(err => this.printFail(name, err));
      } else {
        this.printOk(name, result);
      }
    } catch (err) {
      result = '__failed';
      this.printFail(name, err);
    }
    return result
  }

  printOk (name, msg) {
    this.emit('pass', name, msg || 'ok');
    this.tests.delete(name);
    this.passed.push(name);
  }

  printNoOp (name, msg) {
    this.emit('no-op', name, msg || '--');
    this.tests.delete(name);
    this.noop.push(name);
  }

  printFail (name, err) {
    this.suiteFailed = true;
    let msg;
    if (err) {
      msg = err.stack || err;
    } else {
      msg = 'failed';
    }
    if (err.code === 'ERR_ASSERTION') {
      this.emit('fail', name, err);
    } else {
      this.emit('fail', name, err);
    }
    this.tests.delete(name);
    this.failed.push(name);
  }
}

export default TestRunner;
