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
   * Creates a mixin for use in a class extends expression.
   * @module create-mixin
   */

  /**
   * @alias module:create-mixin
   * @param {class} Src - The class containing the behaviour you wish to mix into another class.
   * @returns {function}
   */
  function createMixin (Src) {
    return function (Base) {
      class Mixed extends Base {}
      for (const propName of Object.getOwnPropertyNames(Src.prototype)) {
        if (propName === 'constructor') continue
        Object.defineProperty(Mixed.prototype, propName, Object.getOwnPropertyDescriptor(Src.prototype, propName));
      }
      if (Src.prototype[Symbol.iterator]) {
        Object.defineProperty(Mixed.prototype, Symbol.iterator, Object.getOwnPropertyDescriptor(Src.prototype, Symbol.iterator));
      }
      return Mixed
    }
  }

  /**
   * @module composite-class
   */

  const _children = new WeakMap();
  const _parent = new WeakMap();

  /**
   * A base class for building standard composite structures. Can also be mixed in.
   * @alias module:composite-class
   */
  class Composite {
    get children () {
      if (_children.has(this)) {
        return _children.get(this)
      } else {
        _children.set(this, []);
        return _children.get(this)
      }
    }
    
    set children (val) {
      _children.set(this, val);
    }

    get parent () {
      return _parent.get(this)
    }
    set parent (val) {
      _parent.set(this, val);
    }

    /**
     * Add a child
     * @returns {Composite}
     */
    add (child) {
      if (!(isComposite(child))) throw new Error('can only add a Composite instance')
      child.parent = this;
      this.children.push(child);
      return child
    }

    /**
     * @param {Composite} child - the child node to append
     * @returns {Composite}
     */
    append (child) {
      if (!(child instanceof Composite)) throw new Error('can only add a Composite instance')
      child.parent = this;
      this.children.push(child);
      return child
    }

    /**
     * @param {Composite} child - the child node to prepend
     * @returns {Composite}
     */
    prepend (child) {
      if (!(child instanceof Composite)) throw new Error('can only add a Composite instance')
      child.parent = this;
      this.children.unshift(child);
      return child
    }

    /**
     * @param {Composite} child - the child node to remove
     * @returns {Composite}
     */
    remove (child) {
      return this.children.splice(this.children.indexOf(child), 1)
    }

    /**
     * depth level in the tree, 0 being root.
     * @returns {number}
     */
    level () {
      let count = 0;
      function countParent (composite) {
        if (composite.parent) {
          count++;
          countParent(composite.parent);
        }
      }
      countParent(this);
      return count
    }

    /**
     * @returns {number}
     */
    getDescendentCount () {
      return Array.from(this).length
    }

    /**
     * prints a tree using the .toString() representation of each node in the tree
     * @returns {string}
     */
    tree () {
      return Array.from(this).reduce((prev, curr) => {
        return prev += `${'  '.repeat(curr.level())}- ${curr}\n`
      }, '')
    }

    /**
     * Returns the root instance of this tree.
     * @returns {Composite}
     */
    root () {
      function getRoot (composite) {
        return composite.parent === null ? composite : getRoot(composite.parent)
      }
      return getRoot(this)
    }

    /**
     * default iteration strategy
     */
    * [Symbol.iterator] () {
      yield this;
      for (let child of this.children) {
        yield * child;
      }
    }

    /**
     * Used by node's `util.inspect`.
     */
    inspect (depth) {
      const clone = Object.assign({}, this);
      delete clone.parent;
      return clone
    }

    /**
     * Returns an array of ancestors
     * @return {Composite[]}
     */
    parents () {
      const output = [];
      function addParent (node) {
        if (node.parent) {
          output.push(node.parent);
          addParent(node.parent);
        }
      }
      addParent(this);
      return output
    }
  }

  function isComposite (item) {
    return item && item.children && item.add && item.level && item.root
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
   * Takes any input and guarantees an array back.
   *
   * - converts array-like objects (e.g. `arguments`) to a real array
   * - converts `undefined` to an empty array
   * - converts any another other, singular value (including `null`) into an array containing that value
   * - ignores input which is already an array
   *
   * @module array-back
   * @example
   * > const arrayify = require('array-back')
   *
   * > arrayify(undefined)
   * []
   *
   * > arrayify(null)
   * [ null ]
   *
   * > arrayify(0)
   * [ 0 ]
   *
   * > arrayify([ 1, 2 ])
   * [ 1, 2 ]
   *
   * > function f(){ return arrayify(arguments); }
   * > f(1,2,3)
   * [ 1, 2, 3 ]
   */

  function isObject (input) {
    return typeof input === 'object' && input !== null
  }

  function isArrayLike (input) {
    return isObject(input) && typeof input.length === 'number'
  }

  /**
   * @param {*} - the input value to convert to an array
   * @returns {Array}
   * @alias module:array-back
   */
  function arrayify (input) {
    if (Array.isArray(input)) {
      return input
    } else {
      if (input === undefined) {
        return []
      } else if (isArrayLike(input)) {
        return Array.prototype.slice.call(input)
      } else {
        return [ input ]
      }
    }
  }

  /**
   * @module fsm-base
   * @typicalname stateMachine
   * @example
   * const StateMachine = require('fsm-base')
   *
   * class Stateful extends StateMachine {
   *  super([
   *    { from: undefined, to: 'one' },
   *    { from: 'one', to: 'two' },
   *    { from: 'two', to: 'three' },
   *    { from: [ 'one', 'three' ], to: 'four'}
   *  ])
   * }
   * const instance = new Stateful()
   * instance.state = 'one'  // valid state change
   * instance.state = 'two'  // valid state change
   * instance.state = 'four' // throws - invalid state change
   */

  const _state = new WeakMap();

  /**
   * @class
   * @alias module:fsm-base
   * @extends {Emitter}
   */
  class StateMachine extends Emitter {
    constructor (validMoves) {
      super();

      this._validMoves = arrayify(validMoves).map(move => {
        if (!Array.isArray(move.from)) move.from = [ move.from ];
        if (!Array.isArray(move.to)) move.to = [ move.to ];
        return move
      });
    }

    /**
     * The current state
     * @type {string} state
     * @throws `INVALID_MOVE` if an invalid move made
     */
    get state () {
      return _state.get(this)
    }

    set state (state) {
      /* nothing to do */
      if (this.state === state) return

      const validTo = this._validMoves.some(move => move.to.indexOf(state) > -1);
      if (!validTo) {
        const msg = `Invalid state: ${state}`;
        const err = new Error(msg);
        err.name = 'INVALID_MOVE';
        throw err
      }

      let moved = false;
      const prevState = this.state;
      this._validMoves.forEach(move => {
        if (move.from.indexOf(this.state) > -1 && move.to.indexOf(state) > -1) {
          _state.set(this, state);
          moved = true;
          /**
           * fired on every state change
           * @event module:fsm-base#state
           * @param state {string} - the new state
           * @param prev {string} - the previous state
           */
          this.emit('state', state, prevState);

          /**
           * fired on every state change
           * @event module:fsm-base#&lt;state value&gt;
           */
          this.emit(state);
        }
      });
      if (!moved) {
        const flatten = require('array-flatten');
        let froms = this._validMoves
          .filter(move => move.to.indexOf(state) > -1)
          .map(move => move.from.map(from => `'${from}'`));
        froms = flatten(froms);
        const msg = `Can only move to '${state}' from ${froms.join(' or ') || '<unspecified>'} (not '${prevState}')`;
        const err = new Error(msg);
        err.name = 'INVALID_MOVE';
        throw err
      }
    }
  }

  /**
   * Test function class.
   * @param {string} name
   * @param {function} testFn
   * @param {object} [options]
   * @param {number} [options.timeout]
   */
  class Test extends createMixin(Composite)(StateMachine) {
    constructor (name, testFn, options) {
      super ([
        { from: undefined, to: 'pending' },
        { from: 'pending', to: 'start' },
        { from: 'start', to: 'pass' },
        { from: 'start', to: 'fail' }
      ]);
      this.name = name;
      this.testFn = testFn;
      this.index = 1;
      this.options = Object.assign({ timeout: 10000 }, options);
      this.state = 'pending';
    }

    toString () {
      return `${this.name}: ${this.state}`
    }

    /**
     * Execute the stored test function.
     * @returns {Promise}
     */
    run () {
      this.state = 'start';
      const testFnResult = new Promise((resolve, reject) => {
        try {
          const result = this.testFn.call(new TestContext({
            name: this.name,
            index: this.index
          }));
          this.state = 'pass';
          if (result && result.then) {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (err) {
          this.state = 'fail';
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
      this.index = context.index;
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
  class Emitter$1 {
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
      createListenersArray$1(this);
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
  Emitter$1.prototype.addEventListener = Emitter$1.prototype.on;

  function createListenersArray$1 (target) {
    if (target._listeners) return
    Object.defineProperty(target, '_listeners', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: []
    });
  }

  var consoleView = ViewBase => class ConsoleView extends ViewBase {
    start (count) {
      console.log(`Starting: ${count} tests`);
    }
    testPass (test, result) {
      console.log('✓', test.name, result || 'ok');
    }
    testSkip (test) {
      console.log('-', test.name);
    }
    testFail (test, err) {
      console.log('⨯', test.name);
      console.log(err);
    }
    end () {
      console.log(`End`);
    }
  };

  class ViewBase {
    attach (runner) {
      if (this.attachedTo !== runner) {
        this._callback = {
          start: this.start.bind(this),
          end: this.end.bind(this),
          testPass: this.testPass.bind(this),
          testFail: this.testFail.bind(this),
          testSkip: this.testSkip.bind(this)
        };
        runner.on('start', this._callback.start);
        runner.on('end', this._callback.end);
        runner.on('test-pass', this._callback.testPass);
        runner.on('test-fail', this._callback.testFail);
        runner.on('test-skip', this._callback.testSkip);
        this.attachedTo = runner;
      }
    }

    detach () {
      if (this.attachedTo && this._callback) {
        this.attachedTo.removeEventListener('start', this._callback.start);
        this.attachedTo.removeEventListener('end', this._callback.end);
        this.attachedTo.removeEventListener('test-pass', this._callback.testPass);
        this.attachedTo.removeEventListener('test-fail', this._callback.testFail);
        this.attachedTo.removeEventListener('test-skip', this._callback.testSkip);
        this.attachedTo = null;
      }
    }

    start (count) {
      throw new Error('not implemented')
    }
    end (count) {
      throw new Error('not implemented')
    }
    testPass (test, result) {
      throw new Error('not implemented')
    }
    testFail (test, err) {
      throw new Error('not implemented')
    }
    testSkip (test) {
      throw new Error('not implemented')
    }
  }

  /**
   * @module test-runner
   */

  /**
   * @alias module:test-runner
   * @emits start
   * @emits end
   * @emits test-start
   * @emits test-end
   * @emits test-pass
   * @emits test-fail
   */
  class TestRunner extends createMixin(Composite)(StateMachine) {
    constructor (options) {
      super([
        { from: undefined, to: 0 },
        { from: 0, to: 1 },
        { from: 1, to: 2 },
      ]);
      options = options || {};
      this.options = options;
      this.state = 0;
      this.name = options.name;
      this._only = [];
      const ViewClass = (options.view || consoleView)(ViewBase);
      this.view = new ViewClass();
      this._beforeExitCallback = this.beforeExit.bind(this);
      this.autoStart = !options.manualStart;
    }

    set autoStart (val) {
      this._autoStart = val;
      if (val) {
        process.setMaxListeners(Infinity);
        process.on('beforeExit', this._beforeExitCallback);
      } else {
        process.removeListener('beforeExit', this._beforeExitCallback);
      }
    }

    get autoStart () {
      return this._autoStart
    }

    removeAll (eventNames) {
      if (!(this._listeners && this._listeners.length)) return
      for (const eventName of eventNames) {
        let l;
        while (l = this._listeners.find(l => l.eventName === eventName)) {
          this._listeners.splice(this._listeners.indexOf(l), 1);
        }
      }
    }

    set view (view) {
      if (view) {
        if (this._view) {
          this._view.detach();
        }
        this._view = view;
        this._view.attach(this);
      } else {
        if (this._view) {
          this._view.detach();
        }
        this._view = null;
      }
    }

    get view () {
      return this._view
    }

    beforeExit () {
      this.start();
    }

    test (name, testFn, options) {
      const test = new Test(name, testFn, options);
      this.add(test);
      test.index = this.children.length;
      return test
    }

    skip (name, testFn, options) {
      const test = this.test(name, testFn, options);
      test.skip = true;
      return test
    }

    only (name, testFn, options) {
      const test = this.test(name, testFn, options);
      test.only = true;
      this._only.push(test);
      return test
    }

    /**
     * Run all tests
     * @returns {Promise}
     */
    start () {
      if (this.state !== 0) return Promise.resolve()
      this.state = 1;
      if (this._only.length) {
        for (const test of this) {
          if (this._only.indexOf(test) === -1) test.skip = true;
        }
      }
      const tests = Array.from(this);
      this.emit('start', tests.length);

      if (this.options.sequential) {
        return this.startSequential()
      } else {
        return this.startParallel()
      }
    }

    startSequential () {
      return new Promise((resolve, reject) => {
        const tests = Array.from(this);
        const run = () => {
          const test = tests.shift();
          if (test) {
            if (test.skip) {
              this.emit('test-skip', test);
              run();
            } else {
              test.run()
                .then(result => {
                  try {
                    this.emitPass(test, result);
                    run();
                  } catch (err) {
                    this.state = 2;
                    this.emit('end');
                    reject(err);
                  }
                })
                .catch(err => {
                  try {
                    this.emitFail(test, err);
                    run();
                  } catch (err) {
                    this.state = 2;
                    this.emit('end');
                    reject(err);
                  }
                });
            }
          } else {
            this.state = 2;
            this.emit('end');
            resolve();
          }
        };
        run();
      })
    }

    startParallel () {
      const tests = Array.from(this).filter(t => t.constructor.name === 'Test');
      return Promise
        .all(tests.map(test => {
          if (test.skip) {
            this.emit('test-skip', test);
          } else {
            this.emit('test-start', test);
            return test.run()
              .then(result => {
                this.emitPass(test, result);
                return result
              })
              .catch(err => {
                this.emitFail(test, err);
              })
          }
        }))
        .then(results => {
          this.state = 2;
          this.emit('end');
          return results
        })
        .catch(err => {
          this.state = 2;
          this.emit('end');
          throw err
        })
    }

    emitPass (test, result) {
      this.emit('test-pass', test, result);
      this.emit('test-end', test, result);
    }
    emitFail (test, err) {
      if (typeof process !== 'undefined') process.exitCode = 1;
      this.emit('test-fail', test, err);
      this.emit('test-end', test, err);
    }

    clear () {
      this._only = [];
    }
  }

  return TestRunner;

})));
