'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var a = _interopDefault(require('assert'));
var http = _interopDefault(require('http'));
var fetch = _interopDefault(require('node-fetch'));

/**
 * @module obso
 */

/**
 * @alias module:obso
 */
class Emitter {
  /**
   * Emit an event.
   * @param {string} eventName - the event name to emit.
   * @param ...args {*} - args to pass to the event handler
   */
  emit (eventName, ...args) {
    if (this._listeners && this._listeners.length > 0) {
      const toRemove = [];

      /* invoke each relevant listener */
      for (const listener of this._listeners) {
        const handlerArgs = args.slice();
        if (listener.eventName === '__ALL__') {
          handlerArgs.unshift(eventName);
        }

        if (listener.eventName === '__ALL__' || listener.eventName === eventName) {
          listener.handler.call(this, ...handlerArgs);

          /* remove once handler */
          if (listener.once) toRemove.push(listener);
        }
      }

      toRemove.forEach(listener => {
        this._listeners.splice(this._listeners.indexOf(listener), 1);
      });
    }

    /* bubble event up */
    if (this.parent) this.parent._emitTarget(eventName, this, ...args);
  }

  _emitTarget (eventName, target, ...args) {
    if (this._listeners && this._listeners.length > 0) {
      const toRemove = [];

      /* invoke each relevant listener */
      for (const listener of this._listeners) {
        const handlerArgs = args.slice();
        if (listener.eventName === '__ALL__') {
          handlerArgs.unshift(eventName);
        }

        if (listener.eventName === '__ALL__' || listener.eventName === eventName) {
          listener.handler.call(target, ...handlerArgs);

          /* remove once handler */
          if (listener.once) toRemove.push(listener);
        }
      }

      toRemove.forEach(listener => {
        this._listeners.splice(this._listeners.indexOf(listener), 1);
      });
    }

    /* bubble event up */
    if (this.parent) this.parent._emitTarget(eventName, target || this, ...args);
  }

   /**
    * Register an event listener.
    * @param {string} [eventName] - The event name to watch. Omitting the name will catch all events.
    * @param {function} handler - The function to be called when `eventName` is emitted. Invocated with `this` set to `emitter`.
    * @param {object} [options]
    * @param {boolean} [options.once] - If `true`, the handler will be invoked once then removed.
    */
  on (eventName, handler, options) {
    createListenersArray(this);
    options = options || {};
    if (arguments.length === 1 && typeof eventName === 'function') {
      handler = eventName;
      eventName = '__ALL__';
    }
    if (!handler) {
      throw new Error('handler function required')
    } else if (handler && typeof handler !== 'function') {
      throw new Error('handler arg must be a function')
    } else {
      this._listeners.push({ eventName, handler: handler, once: options.once });
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

  /**
   * Once.
   * @param {string} eventName - the event name to watch
   * @param {function} handler - the event handler
   */
  once (eventName, handler) {
    /* TODO: the once option is browser-only */
    this.on(eventName, handler, { once: true });
  }

  /**
   * Propagate.
   * @param {string} eventName - the event name to propagate
   * @param {object} from - the emitter to propagate from
   */
  propagate (eventName, from) {
    from.on(eventName, (...args) => this.emit(eventName, ...args));
  }
}

/**
 * Alias for `on`.
 */
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
 */

const _state = new WeakMap();
const _validMoves = new WeakMap();

/**
 * @class
 * @alias module:fsm-base
 * @extends {Emitter}
 */
class StateMachine extends Emitter {
  constructor (validMoves) {
    super();
    _validMoves.set(this, arrayify(validMoves).map(move => {
      if (!Array.isArray(move.from)) move.from = [ move.from ];
      if (!Array.isArray(move.to)) move.to = [ move.to ];
      return move
    }));
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
    this.setState(state);
  }

  /**
   * Set the current state. The second arg onward will be sent as event args.
   * @param {string} state
   */
  setState (state, ...args) {
    /* nothing to do */
    if (this.state === state) return

    const validTo = _validMoves.get(this).some(move => move.to.indexOf(state) > -1);
    if (!validTo) {
      const msg = `Invalid state: ${state}`;
      const err = new Error(msg);
      err.name = 'INVALID_MOVE';
      throw err
    }

    let moved = false;
    const prevState = this.state;
    _validMoves.get(this).forEach(move => {
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
        this.emit(state, ...args);
      }
    });
    if (!moved) {
      let froms = _validMoves.get(this)
        .filter(move => move.to.indexOf(state) > -1)
        .map(move => move.from.map(from => `'${from}'`))
        .reduce(flatten);
      const msg = `Can only move to '${state}' from ${froms.join(' or ') || '<unspecified>'} (not '${prevState}')`;
      const err = new Error(msg);
      err.name = 'INVALID_MOVE';
      throw err
    }
  }
}

function flatten (prev, curr) {
  return prev.concat(curr)
}

class Queue {
  /**
   * @param {function[]} jobs - An array of functions, each of which return a Promise
   * @param {number} maxConcurrency
   */
  constructor (jobs, maxConcurrency) {
    this.jobs = jobs;
    this.activeCount = 0;
    this.maxConcurrency = maxConcurrency || 10;
  }

  async process () {
    let output = [];
    while (this.jobs.length) {
      const slotsAvailable = this.maxConcurrency - this.activeCount;
      if (slotsAvailable > 0) {
        const toRun = [];
        for (let i = 0; i < slotsAvailable; i++) {
          const job = this.jobs.shift();
          if (job) {
            toRun.push(job());
            this.activeCount++;
          }
        }
        const results = await Promise.all(toRun);
        this.activeCount -= results.length;
        output = output.concat(results);
      }
    }
    return output
  }
}

/**
 * @module test-runner-core
 */

/**
 * @alias module:test-runner-core
 * @param {object} [options]
 * @param {function} [options.view]
 * @param {object} [options.tom]
 * @emits start
 * @emits end
 */
class TestRunnerCore extends StateMachine {
  constructor (options) {
    options = options || {};
    if (!options.tom) throw new Error('tom required')
    super([
      { from: undefined, to: 'pending' },
      { from: 'pending', to: 'in-progress' },
      { from: 'in-progress', to: 'pass' },
      { from: 'in-progress', to: 'fail' }
    ]);

    /**
     * State machine: pending -> in-progress -> pass or fail
     * @type {string}
     */
    this.state = 'pending';
    this.options = options;

    /**
     * Test Object Model
     * @type {TestObjectModel}
     */
    this.tom = options.tom;

    /**
     * Ended flag
     * @type {boolean}
     */
    this.ended = false;

    /**
     * View
     * @type {View}
     */
    this.view = options.view;

    /**
     * Runner stats
     */
    this.stats = {
      start: 0,
      end: 0,
      pass: 0,
      fail: 0,
      skip: 0,
      ignore: 0,
      timeElapsed: function () {
        return this.end - this.start
      }
    };

    this.on('start', (...args) => {
      if (this.view && this.view.start) this.view.start(...args);
    });
    this.on('end', (...args) => {
      if (this.view && this.view.end) this.view.end(...args);
    });
    this.on('test-pass', (...args) => {
      if (this.view && this.view.testPass) this.view.testPass(...args);
    });
    this.on('test-fail', (...args) => {
      if (this.view && this.view.testFail) this.view.testFail(...args);
    });
    this.on('test-skip', (...args) => {
      if (this.view && this.view.testSkip) this.view.testSkip(...args);
    });
    this.on('test-ignore', (...args) => {
      if (this.view && this.view.testIgnore) this.view.testIgnore(...args);
    });

    this.tom.on('pass', (...args) => {
      this.stats.pass++;
      this.emit('test-pass', ...args);
    });
    this.tom.on('fail', (...args) => {
      this.stats.fail++;
      this.emit('test-fail', ...args);
    });
    this.tom.on('skip', (...args) => {
      this.stats.skip++;
      this.emit('test-skip', ...args);
    });
    this.tom.on('ignored', (...args) => {
      this.stats.ignore++;
      this.emit('test-ignore', ...args);
    });
  }

  /**
   * Start the runner
   * @returns {Promise}
   */
  async start () {
    this.stats.start = Date.now();
    const tests = Array.from(this.tom);

    /* encapsulate this in TOM? */
    const testCount = tests.filter(t => t.testFn).length;

    /**
     * in-progress
     * @event module:test-runner-core#in-progress
     * @param testCount {number} - the numbers of tests
     */
    this.setState('in-progress', testCount);

    /**
     * Start
     * @event module:test-runner-core#start
     * @param testCount {number} - the numbers of tests
     */
    this.emit('start', testCount);

    const jobs = tests.map(test => {
      return () => {
        return test.run().catch(err => {
          /**
           * Test suite failed
           * @event module:test-runner-core#fail
           */
          this.state = 'fail';
          // keep going when tests fail but crash for programmer error
          // if (err.code !== 'ERR_ASSERTION') {
          //   console.error('TEST ERROR')
          //   console.error(err)
          // }
        })
      }
    });
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const queue = new Queue(jobs, this.tom.options.concurrency);
        const results = await queue.process();
        this.ended = true;
        if (this.state !== 'fail') {
          /**
           * Test suite passed
           * @event module:test-runner-core#pass
           */
          this.state = 'pass';
        }
        /**
         * Test suite ended
         * @event module:test-runner-core#end
         */
        this.stats.end = Date.now();
        this.emit('end', this.stats);
        return resolve(results)
      }, 0);
    })
  }
}

function halt (err) {
  console.log(err);
  process.exitCode = 1;
}

function sleep (ms, result) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(result), ms);
  })
}

{ /* new TestRunner: no tom */
  try {
    const runner = new TestRunnerCore();
  } catch (err) {
    if (!/tom required/i.test(err.message)) halt(err);
  }
}

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
  /**
   * Children
   * @type {Array}
   */
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


  /**
   * Parent
   * @type {Composite}
   */
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
      return composite.parent ? getRoot(composite.parent) : composite
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
 * @module obso
 */

/**
 * @alias module:obso
 */
class Emitter$1 {
  /**
   * Emit an event.
   * @param {string} eventName - the event name to emit.
   * @param ...args {*} - args to pass to the event handler
   */
  emit (eventName, ...args) {
    if (this._listeners && this._listeners.length > 0) {
      const toRemove = [];

      /* invoke each relevant listener */
      for (const listener of this._listeners) {
        const handlerArgs = args.slice();
        if (listener.eventName === '__ALL__') {
          handlerArgs.unshift(eventName);
        }

        if (listener.eventName === '__ALL__' || listener.eventName === eventName) {
          listener.handler.call(this, ...handlerArgs);

          /* remove once handler */
          if (listener.once) toRemove.push(listener);
        }
      }

      toRemove.forEach(listener => {
        this._listeners.splice(this._listeners.indexOf(listener), 1);
      });
    }

    /* bubble event up */
    if (this.parent) this.parent._emitTarget(eventName, this, ...args);
  }

  _emitTarget (eventName, target, ...args) {
    if (this._listeners && this._listeners.length > 0) {
      const toRemove = [];

      /* invoke each relevant listener */
      for (const listener of this._listeners) {
        const handlerArgs = args.slice();
        if (listener.eventName === '__ALL__') {
          handlerArgs.unshift(eventName);
        }

        if (listener.eventName === '__ALL__' || listener.eventName === eventName) {
          listener.handler.call(target, ...handlerArgs);

          /* remove once handler */
          if (listener.once) toRemove.push(listener);
        }
      }

      toRemove.forEach(listener => {
        this._listeners.splice(this._listeners.indexOf(listener), 1);
      });
    }

    /* bubble event up */
    if (this.parent) this.parent._emitTarget(eventName, target || this, ...args);
  }

   /**
    * Register an event listener.
    * @param {string} [eventName] - The event name to watch. Omitting the name will catch all events.
    * @param {function} handler - The function to be called when `eventName` is emitted. Invocated with `this` set to `emitter`.
    * @param {object} [options]
    * @param {boolean} [options.once] - If `true`, the handler will be invoked once then removed.
    */
  on (eventName, handler, options) {
    createListenersArray$1(this);
    options = options || {};
    if (arguments.length === 1 && typeof eventName === 'function') {
      handler = eventName;
      eventName = '__ALL__';
    }
    if (!handler) {
      throw new Error('handler function required')
    } else if (handler && typeof handler !== 'function') {
      throw new Error('handler arg must be a function')
    } else {
      this._listeners.push({ eventName, handler: handler, once: options.once });
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

  /**
   * Once.
   * @param {string} eventName - the event name to watch
   * @param {function} handler - the event handler
   */
  once (eventName, handler) {
    /* TODO: the once option is browser-only */
    this.on(eventName, handler, { once: true });
  }

  /**
   * Propagate.
   * @param {string} eventName - the event name to propagate
   * @param {object} from - the emitter to propagate from
   */
  propagate (eventName, from) {
    from.on(eventName, (...args) => this.emit(eventName, ...args));
  }
}

/**
 * Alias for `on`.
 */
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

function isObject$1 (input) {
  return typeof input === 'object' && input !== null
}

function isArrayLike$1 (input) {
  return isObject$1(input) && typeof input.length === 'number'
}

/**
 * @param {*} - the input value to convert to an array
 * @returns {Array}
 * @alias module:array-back
 */
function arrayify$1 (input) {
  if (Array.isArray(input)) {
    return input
  } else {
    if (input === undefined) {
      return []
    } else if (isArrayLike$1(input)) {
      return Array.prototype.slice.call(input)
    } else {
      return [ input ]
    }
  }
}

/**
 * @module fsm-base
 * @typicalname stateMachine
 */

const _state$1 = new WeakMap();
const _validMoves$1 = new WeakMap();

/**
 * @class
 * @alias module:fsm-base
 * @extends {Emitter}
 */
class StateMachine$1 extends Emitter$1 {
  constructor (validMoves) {
    super();
    _validMoves$1.set(this, arrayify$1(validMoves).map(move => {
      if (!Array.isArray(move.from)) move.from = [ move.from ];
      if (!Array.isArray(move.to)) move.to = [ move.to ];
      return move
    }));
  }

  /**
   * The current state
   * @type {string} state
   * @throws `INVALID_MOVE` if an invalid move made
   */
  get state () {
    return _state$1.get(this)
  }

  set state (state) {
    this.setState(state);
  }

  /**
   * Set the current state. The second arg onward will be sent as event args.
   * @param {string} state
   */
  setState (state, ...args) {
    /* nothing to do */
    if (this.state === state) return

    const validTo = _validMoves$1.get(this).some(move => move.to.indexOf(state) > -1);
    if (!validTo) {
      const msg = `Invalid state: ${state}`;
      const err = new Error(msg);
      err.name = 'INVALID_MOVE';
      throw err
    }

    let moved = false;
    const prevState = this.state;
    _validMoves$1.get(this).forEach(move => {
      if (move.from.indexOf(this.state) > -1 && move.to.indexOf(state) > -1) {
        _state$1.set(this, state);
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
        this.emit(state, ...args);
      }
    });
    if (!moved) {
      let froms = _validMoves$1.get(this)
        .filter(move => move.to.indexOf(state) > -1)
        .map(move => move.from.map(from => `'${from}'`))
        .reduce(flatten$1);
      const msg = `Can only move to '${state}' from ${froms.join(' or ') || '<unspecified>'} (not '${prevState}')`;
      const err = new Error(msg);
      err.name = 'INVALID_MOVE';
      throw err
    }
  }
}

function flatten$1 (prev, curr) {
  return prev.concat(curr)
}

/**
 * @module test-object-model
 */

/**
 * @param {string} [name]
 * @param {function} [testFn]
 * @param {object} [options]
 * @param {number} [options.timeout]
 * @alias module:test-object-model
 */
class Test extends createMixin(Composite)(StateMachine$1) {
  constructor (name, testFn, options) {
    if (typeof name === 'string') {
      if (isPlainObject(testFn)) {
        options = testFn;
        testFn = undefined;
      }
    } else if (typeof name === 'function') {
      options = testFn;
      testFn = name;
      name = '';
    } else if (typeof name === 'object') {
      options = name;
      testFn = undefined;
      name = '';
    }
    options = options || {};
    name = name || 'tom';
    super ([
      { from: undefined, to: 'pending' },
      { from: 'pending', to: 'in-progress' },
      { from: 'pending', to: 'skip' },
      { from: 'pending', to: 'ignored' },
      { from: 'in-progress', to: 'pass' },
      { from: 'in-progress', to: 'fail' },
      /* reset */
      { from: 'in-progress', to: 'pending' },
      { from: 'pass', to: 'pending' },
      { from: 'fail', to: 'pending' },
      { from: 'skip', to: 'pending' },
      { from: 'ignored', to: 'pending' },
    ]);
    /**
     * Test name
     * @type {string}
     */
    this.name = name;

    /**
     * Test function
     * @type {function}
     */
    this.testFn = testFn;

    /**
     * Position of this test within its parents children
     */
    this.index = 1;

    /**
     * Test state: pending, start, skip, pass or fail.
     */
    this.state = 'pending';
    this._markSkip = options._markSkip;
    this._skip = null;
    this._only = options.only;
    this.options = Object.assign({ timeout: 10000 }, options);

    /**
     * True if ended
     */
    this.ended = false;
  }

  toString () {
    return `${this.name}`
  }

  /**
   * Add a test.
   */
  test (name, testFn, options) {
    for (const child of this) {
      if (child.name === name) {
        throw new Error('Duplicate name: ' + name)
      }
    }
    const test = new this.constructor(name, testFn, options);
    this.add(test);
    test.index = this.children.length;
    this._skipLogic();
    return test
  }

  /**
   * Add a skipped test
   */
  skip (name, testFn, options) {
    options = options || {};
    options._markSkip = true;
    const test = this.test(name, testFn, options);
    return test
  }

  /**
   * Add an only test
   */
  only (name, testFn, options) {
    options = options || {};
    options.only = true;
    const test = this.test(name, testFn, options);
    return test
  }

  _onlyExists () {
    return Array.from(this.root()).some(t => t._only)
  }

  _skipLogic () {
    if (this._onlyExists()) {
      for (const test of this.root()) {
        if (test._markSkip) {
          test._skip = true;
        } else {
          test._skip = !test._only;
        }
      }
    } else {
      for (const test of this.root()) {
        test._skip = test._markSkip;
      }
    }
  }

  setState (state, target, data) {
    if (state === 'pass' || state === 'fail') {
      this.ended = true;
    }
    super.setState(state, target, data);
    if (state === 'pass' || state === 'fail') {
      this.emit('end');
    }
  }

  /**
   * Execute the stored test function.
   * @returns {Promise}
   */
  run () {
    if (this.testFn) {
      if (this._skip) {
        this.setState('skip', this);
        return Promise.resolve()
      } else {
        this.setState('in-progress', this);
        this.emit('start');
        const testFnResult = new Promise((resolve, reject) => {
          try {
            const result = this.testFn.call(new TestContext({
              name: this.name,
              index: this.index
            }));

            if (result && result.then) {
              result
                .then(testResult => {
                  this.setState('pass', this, testResult);
                  resolve(testResult);
                })
                .catch(err => {
                  this.setState('fail', this, err);
                  reject(err);
                });
            } else {
              this.setState('pass', this, result);
              resolve(result);
            }
          } catch (err) {
            this.setState('fail', this, err);
            reject(err);
          }
        });
        return Promise.race([ testFnResult, raceTimeout(this.options.timeout) ])
      }
    } else {
      this.setState('ignored', this);
      return Promise.resolve()
    }
  }

  /**
   * Reset state
   */
  reset (deep) {
    if (deep) {
      for (const tom of this) {
        tom.reset();
      }
    } else {
      this.index = 1;
      this.state = 'pending';
      this._skip = null;
      this._only = null;
    }
  }

  /**
   * Combine several TOM instances into a common root
   * @param {Array.<Test>} tests
   * @param {string} [name]
   * @return {Test}
   */
  static combine (tests, name) {
    let test;
    if (tests.length > 1) {
      test = new this(name);
      for (const subTom of tests) {
        test.add(subTom);
      }

    } else {
      test = tests[0];
    }
    test._skipLogic();
    return test
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

function isPlainObject (input) {
  return input !== null && typeof input === 'object' && input.constructor === Object
}

{ /* runner events: start, end */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => 1);
  tom.test('two', () => 2);

  const runner = new TestRunnerCore({ tom });
  runner.on('start', count => {
    counts.push('start');
    a.strictEqual(count, 2);
  });
  runner.on('end', () => counts.push('end'));
  setTimeout(() => {
    a.deepStrictEqual(counts, [ 'start', 'end' ]);
  }, 100);
  runner.start();
}

{ /* runner events: start, test-pass, end */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => 1);
  tom.test('two', () => 2);

  const runner = new TestRunnerCore({ tom });
  runner.on('start', () => counts.push('start'));
  runner.on('end', () => counts.push('end'));
  runner.on('test-pass', () => counts.push('test-pass'));
  setTimeout(() => {
    a.deepStrictEqual(counts, [ 'start', 'test-pass', 'test-pass', 'end' ]);
  }, 100);
  runner.start();
}

{ /* runner events: start, test-fail, end */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => {
    throw new Error('broken')
  });
  tom.test('two', () => {
    throw new Error('broken2')
  });

  const runner = new TestRunnerCore({ tom });
  runner.on('start', () => counts.push('start'));
  runner.on('end', () => counts.push('end'));
  runner.on('test-pass', () => counts.push('test-pass'));
  runner.on('test-fail', () => counts.push('test-fail'));
  /* why is this in a timeout? */
  setTimeout(() => {
    a.deepStrictEqual(counts, [ 'start', 'test-fail', 'test-fail', 'end' ]);
  }, 100);
  runner.start();
}

{ /* runner.start(): pass, fail, skip events */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => true);
  tom.test('two', () => { throw new Error('fail') });
  tom.skip('three', () => true);

  const runner = new TestRunnerCore({ tom });
  runner.on('test-pass', () => counts.push('test-pass'));
  runner.on('test-fail', () => counts.push('test-fail'));
  runner.on('test-skip', () => counts.push('test-skip'));
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'test-pass', 'test-fail', 'test-skip' ]);
    })
    .catch(halt);
}

{ /* runner.start(): only */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => 1);
  tom.test('two', () => 2);
  tom.only('three', () => 3);

  const runner = new TestRunnerCore({ tom });
  runner.on('test-pass', () => counts.push('test-pass'));
  runner.on('test-fail', () => counts.push('test-fail'));
  runner.on('test-skip', () => counts.push('test-skip'));
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'test-skip', 'test-skip', 'test-pass' ]);
    })
    .catch(halt);
}

{ /* runner.start(): deep only */
  let counts = [];
  const tom = new Test();
  const one = tom.only('one', () => 1);
  const two = one.test('two', () => 2);
  const three = two.only('three', () => 3);

  const runner = new TestRunnerCore({ tom });
  runner.on('test-pass', () => counts.push('test-pass'));
  runner.on('test-fail', () => counts.push('test-fail'));
  runner.on('test-skip', () => counts.push('test-skip'));
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'test-pass', 'test-skip', 'test-pass' ]);
    })
    .catch(halt);
}

{ /* runner.start(): deep only with fail */
  let counts = [];
  const tom = new Test();
  const one = tom.only('one', () => 1);
  const two = one.test('two', () => 2);
  const three = two.only('three', () => {
    throw new Error('broken')
  });

  const runner = new TestRunnerCore({ tom });
  runner.on('test-pass', () => counts.push('test-pass'));
  runner.on('test-fail', () => counts.push('test-fail'));
  runner.on('test-skip', () => counts.push('test-skip'));
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'test-pass', 'test-skip', 'test-fail' ]);
    })
    .catch(halt);
}

{ /* runner.start(): deep only with skipped fail */
  let counts = [];
  const tom = new Test();
  const one = tom.only('one', () => 1);
  const two = one.test('two', () => 2);
  const three = two.skip('three', () => {
    throw new Error('broken')
  });

  const runner = new TestRunnerCore({ tom });
  runner.on('test-pass', () => counts.push('test-pass'));
  runner.on('test-fail', () => counts.push('test-fail'));
  runner.on('test-skip', () => counts.push('test-skip'));
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'test-pass', 'test-skip', 'test-skip' ]);
    })
    .catch(halt);
}

function sleep$1 (ms, returnValue) {
  return new Promise(resolve => setTimeout(() => resolve(returnValue), ms))
}

async function start () { 
  {
    /* process(), maxConcurrency 1 */
    // TODO: ensure only one test runs at a time
    function createJob (ms, result) {
      return function () {
        sleep$1(ms);
        return result
      }
    }
    const queue = new Queue([
      createJob(30, 1),
      createJob(20, 1.1),
      createJob(50, 1.2),
    ], 1);

    const results = await queue.process();
    a.deepStrictEqual(results, [ 1, 1.1, 1.2 ]);
  }
}

start().catch(halt);

{ /* concurrency usage */
  // TODO: ensure only one test runs at a time
  let counts = [];
  const tom = new Test({ concurrency: 1 });
  tom
    .test(() => {
      sleep(30);
      counts.push(1);
    })
    .test(() => {
      sleep(20);
      counts.push(1.1);
    })
    .test(() => {
      sleep(50);
      counts.push(1.2);
    });
  tom
    .test(() => {
      sleep(10);
      counts.push(2);
    })
    .test(() => {
      sleep(40);
      counts.push(2.1);
    })
    .test(() => {
      sleep(60);
      counts.push(2.2);
    });

  const runner = new TestRunnerCore({ tom });
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 1, 1.1, 1.2, 2, 2.1, 2.2 ]);
    })
    .catch(halt);
}

{ /* runner.start(): execution order */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => {
    counts.push('one');
  });
  tom.test('two', () => {
    counts.push('two');
  });

  const runner = new TestRunnerCore({ tom });
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'one', 'two' ]);
    })
    .catch(halt);
}

{ /* runner.start(): execution order 2 */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => {
    counts.push('one');
    throw new Error('broken')
  });
  tom.test('two', () => {
    counts.push('two');
    throw new Error('broken2')
  });

  const runner = new TestRunnerCore({ tom });
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'one', 'two' ]);
    })
    .catch(halt);
}

{ /* timeout tests */
  let counts = [];
  const tom = new Test('Sequential tests', null, { concurrency: 1 });
  tom.test('one', function () {
    a.deepStrictEqual(counts, []);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        counts.push(1);
        resolve(1);
      }, 1000);
    })
  });

  tom.test('two', function () {
    a.deepStrictEqual(counts, [ 1 ]);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        counts.push(2);
        resolve(2);
      }, 500);
    })
  });

  tom.test('three', function () {
    a.deepStrictEqual(counts, [ 1, 2 ]);
    counts.push(3);
    return 3
  });

  const runner = new TestRunnerCore({ tom });
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 1, 2, 3 ]);
    })
    .catch(halt);
}

{ /* http server tests */
  let counts = [];
  const tom = new Test('Sequential tests', null, { concurrency: 1 });
  tom.test('one', function () {
    const server = http.createServer((req, res) => {
      setTimeout(() => {
        res.writeHead(200);
        res.end();
      }, 100);
    });
    server.listen(9000);
    return new Promise((resolve, reject) => {
      setImmediate(() => {
        fetch('http://localhost:9000/').then(response => {
          counts.push(response.status);
          resolve(response.status);
          server.close();
        });
      });
    })
  });

  tom.test('two', function () {
    const server = http.createServer((req, res) => {
      setTimeout(() => {
        res.writeHead(201);
        res.end();
      }, 10);
    });
    server.listen(9000);
    return new Promise((resolve, reject) => {
      setImmediate(() => {
        fetch('http://localhost:9000/').then(response => {
          counts.push(response.status);
          resolve(response.status);
          server.close();
        });
      });
    })
  });

  const runner = new TestRunnerCore({ tom });
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 200, 201 ]);
    })
    .catch(halt);
}

{ /* runner states: pass */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => 1);
  tom.test('two', () => 2);
  tom.on('pass', () => counts.push('test-pass'));
  tom.on('fail', () => counts.push('test-fail'));

  const runner = new TestRunnerCore({ tom });
  counts.push('prop:' + runner.state);
  runner.on('state', state => counts.push('event:' + state));
  a.deepStrictEqual(runner.ended, false);
  runner.start()
    .then(() => {
      counts.push('prop:' + runner.state);
      a.deepStrictEqual(counts, [ 'prop:pending', 'event:in-progress', 'prop:in-progress', 'test-pass', 'test-pass', 'event:pass', 'prop:pass' ]);
      a.deepStrictEqual(runner.ended, true);
    })
    .catch(halt);
  counts.push('prop:' + runner.state);
}

{ /* runner states: fail */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => {
    throw new Error('broken')
  });
  tom.test('two', () => 2);
  tom.on('pass', () => counts.push('test-pass'));
  tom.on('fail', () => counts.push('test-fail'));

  const runner = new TestRunnerCore({ tom });
  counts.push('prop:' + runner.state);
  runner.on('state', state => counts.push('event:' + state));
  a.deepStrictEqual(runner.ended, false);
  runner.start()
    .then(() => {
      counts.push('prop:' + runner.state);
      a.deepStrictEqual(counts, [ 'prop:pending', 'event:in-progress', 'prop:in-progress', 'test-fail', 'test-pass', 'event:fail', 'prop:fail' ]);
      a.deepStrictEqual(runner.ended, true);
    })
    .catch(halt);
  counts.push('prop:' + runner.state);
}

{ /* runner states: fail, reject */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => {
    return Promise.reject(new Error('broken'))
  });
  tom.test('two', () => 2);
  tom.on('pass', () => counts.push('test-pass'));
  tom.on('fail', () => counts.push('test-fail'));

  const runner = new TestRunnerCore({ tom });
  counts.push('prop:' + runner.state);
  runner.on('state', state => counts.push('event:' + state));
  a.deepStrictEqual(runner.ended, false);
  runner.start()
    .then(() => {
      counts.push('prop:' + runner.state);
      a.deepStrictEqual(counts, [ 'prop:pending', 'event:in-progress', 'prop:in-progress', 'test-pass', 'test-fail', 'event:fail', 'prop:fail' ]);
      a.deepStrictEqual(runner.ended, true);
    })
    .catch(halt);
  counts.push('prop:' + runner.state);
}

{ /* custom view */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => counts.push('one'));
  tom.test('two', () => counts.push('two'));

  class View {
    start () {
      counts.push('start');
    }
    end () {
      counts.push('end');
    }
    testPass (test, result) {
      counts.push('testPass');
    }
    testFail (test, err) {
      counts.push('testFail');
    }
    testSkip (test) {
      counts.push('testSkip');
    }
  }

  const runner = new TestRunnerCore({ view: new View(), tom });
  runner.start()
    .then(() => a.deepStrictEqual(counts, [ 'start', 'one', 'testPass', 'two', 'testPass', 'end' ]))
    .catch(halt);
}
