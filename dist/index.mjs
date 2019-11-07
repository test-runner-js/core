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
   * Propagate events from the supplied emitter to this emitter.
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
 * - Converts array-like objects (e.g. `arguments`, `Set`) to a real array.
 * - Converts `undefined` to an empty array.
 * - Converts any another other, singular value (including `null`, objects and iterables other than `Set`) into an array containing that value.
 * - Ignores input which is already an array.
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
 * > arrayify(new Set([ 1, 2 ]))
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
 * @param {*} - The input value to convert to an array
 * @returns {Array}
 * @alias module:array-back
 */
function arrayify (input) {
  if (Array.isArray(input)) {
    return input
  }

  if (input === undefined) {
    return []
  }

  if (isArrayLike(input) || input instanceof Set) {
    return Array.from(input)
  }

  return [ input ]
}

/**
 * Isomorphic map-reduce function to flatten an array into the supplied array.
 *
 * @module reduce-flatten
 * @example
 * const flatten = require('reduce-flatten')
 */

/**
 * @alias module:reduce-flatten
 * @example
 * > numbers = [ 1, 2, [ 3, 4 ], 5 ]
 * > numbers.reduce(flatten, [])
 * [ 1, 2, 3, 4, 5 ]
 */
function flatten (arr, curr) {
  if (Array.isArray(curr)) {
    arr.push(...curr);
  } else {
    arr.push(curr);
  }
  return arr
}

/**
 * @module fsm-base
 * @typicalname stateMachine
 */

const _initialState = new WeakMap();
const _state = new WeakMap();
const _validMoves = new WeakMap();

/**
 * @alias module:fsm-base
 * @extends {Emitter}
 */
class StateMachine extends Emitter {
  constructor (initialState, validMoves) {
    super();
    _validMoves.set(this, arrayify(validMoves).map(move => {
      move.from = arrayify(move.from);
      move.to = arrayify(move.to);
      return move
    }));
    _state.set(this, initialState);
    _initialState.set(this, initialState);
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
      const froms = _validMoves.get(this)
        .filter(move => move.to.indexOf(state) > -1)
        .map(move => move.from.map(from => `'${from}'`))
        .reduce(flatten);
      const msg = `Can only move to '${state}' from ${froms.join(' or ') || '<unspecified>'} (not '${prevState}')`;
      const err = new Error(msg);
      err.name = 'INVALID_MOVE';
      throw err
    }
  }

  resetState () {
    const prevState = this.state;
    const initialState = _initialState.get(this);
    _state.set(this, initialState);
    this.emit('reset', prevState);
  }
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

  // TODO: composite structure, i.e. a Queue can have another Queue as one of its jobs.
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
        output.push(...results);
      }
    }
    return output
  }
}

class Stats {
  constructor () {
    this.total = 0;
    this.start = 0;
    this.end = 0;
    this.pass = 0;
    this.fail = 0;
    this.skip = 0;
    this.ignore = 0;
    this.timeElapsed = function () {
      return this.end - this.start
    };
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
 * An isomorphic, load-anywhere JavaScript class for building [composite structures](https://en.wikipedia.org/wiki/Composite_pattern). Suitable for use as a super class or mixin.
 * @module composite-class
 * @example
 * const Composite = require('composite-class')
 */

const _children = new WeakMap();
const _parent = new WeakMap();

/**
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
      return (prev += `${'  '.repeat(curr.level())}- ${curr}\n`)
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
    for (const child of this.children) {
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
   * Propagate events from the supplied emitter to this emitter.
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
 * - Converts array-like objects (e.g. `arguments`, `Set`) to a real array.
 * - Converts `undefined` to an empty array.
 * - Converts any another other, singular value (including `null`, objects and iterables other than `Set`) into an array containing that value.
 * - Ignores input which is already an array.
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
 * > arrayify(new Set([ 1, 2 ]))
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
 * @param {*} - The input value to convert to an array
 * @returns {Array}
 * @alias module:array-back
 */
function arrayify$1 (input) {
  if (Array.isArray(input)) {
    return input
  }

  if (input === undefined) {
    return []
  }

  if (isArrayLike$1(input) || input instanceof Set) {
    return Array.from(input)
  }

  return [ input ]
}

/**
 * Isomorphic map-reduce function to flatten an array into the supplied array.
 *
 * @module reduce-flatten
 * @example
 * const flatten = require('reduce-flatten')
 */

/**
 * @alias module:reduce-flatten
 * @example
 * > numbers = [ 1, 2, [ 3, 4 ], 5 ]
 * > numbers.reduce(flatten, [])
 * [ 1, 2, 3, 4, 5 ]
 */
function flatten$1 (arr, curr) {
  if (Array.isArray(curr)) {
    arr.push(...curr);
  } else {
    arr.push(curr);
  }
  return arr
}

/**
 * @module fsm-base
 * @typicalname stateMachine
 */

const _initialState$1 = new WeakMap();
const _state$1 = new WeakMap();
const _validMoves$1 = new WeakMap();

/**
 * @alias module:fsm-base
 * @extends {Emitter}
 */
class StateMachine$1 extends Emitter$1 {
  constructor (initialState, validMoves) {
    super();
    _validMoves$1.set(this, arrayify$1(validMoves).map(move => {
      move.from = arrayify$1(move.from);
      move.to = arrayify$1(move.to);
      return move
    }));
    _state$1.set(this, initialState);
    _initialState$1.set(this, initialState);
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
      const froms = _validMoves$1.get(this)
        .filter(move => move.to.indexOf(state) > -1)
        .map(move => move.from.map(from => `'${from}'`))
        .reduce(flatten$1);
      const msg = `Can only move to '${state}' from ${froms.join(' or ') || '<unspecified>'} (not '${prevState}')`;
      const err = new Error(msg);
      err.name = 'INVALID_MOVE';
      throw err
    }
  }

  resetState () {
    const prevState = this.state;
    const initialState = _initialState$1.get(this);
    _state$1.set(this, initialState);
    this.emit('reset', prevState);
  }
}

/**
 * The test context, available as `this` within each test function.
 */
class TestContext {
  constructor (context) {
    /**
     * The name given to this test.
     */
    this.name = context.name;
    /**
     * The test index within the current set.
     */
    this.index = context.index;
  }
}

/**
 * Isomorphic, functional type-checking for Javascript.
 * @module typical
 * @typicalname t
 * @example
 * const t = require('typical')
 * const allDefined = array.every(t.isDefined)
 */

/**
 * Returns true if the input value is defined.
 * @param {*} - the input to test
 * @returns {boolean}
 * @static
 */
function isDefined (input) {
  return typeof input !== 'undefined'
}

/**
 * Returns true if the input is a Promise.
 * @param {*} - the input to test
 * @returns {boolean}
 * @static
 */
function isPromise (input) {
  if (input) {
    const isPromise = isDefined(Promise) && input instanceof Promise;
    const isThenable = input.then && typeof input.then === 'function';
    return !!(isPromise || isThenable)
  } else {
    return false
  }
}

/**
 * @module test-object-model
 */

/**
 * @param {string} [name] - The test name.
 * @param {function} [testFn] - A function which will either complete successfully, reject or throw.
 * @param {object} [options]
 * @param {number} [options.timeout] - A time limit for the test in ms.
 * @param {number} [options.maxConcurrency] - The max concurrency that asynchronous child jobs can run.
 * @param {boolean} [options.skip] - Skip this test.
 * @param {boolean} [options.only] - Only run this test.
 * @alias module:test-object-model
 */
class Tom extends createMixin(Composite)(StateMachine$1) {
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
    options = Object.assign({ timeout: 10000 }, options);
    name = name || 'tom';
    super('pending', [
      { from: 'pending', to: 'in-progress' },
      { from: 'pending', to: 'skipped' },
      { from: 'pending', to: 'ignored' },
      { from: 'in-progress', to: 'pass' },
      { from: 'in-progress', to: 'fail' }
    ]);
    /**
     * Test name
     * @type {string}
     */
    this.name = name;

    /**
     * A function which will either complete successfully, reject or throw.
     * @type {function}
     */
    this.testFn = testFn;

    /**
     * Position of this test within its parents children
     * @type {number}
     */
    this.index = 1;

    /**
     * Test state: pending, start, skip, pass or fail.
     * @member {string} module:test-object-model#state
     */

    /**
     * A time limit for the test in ms.
     * @type {number}
     */
    this.timeout = options.timeout;

    /**
     * True if the test has ended.
     * @type {boolean}
     */
    this.ended = false;

    /**
     * The value returned by the test function, if it ended successfully.
     * @type {*}
     */
    this.result = undefined;

    /**
     * The max concurrency that asynchronous child jobs can run.
     * @type {number}
     * @default 10
     */
    this.maxConcurrency = options.maxConcurrency || 10;

    this.markedSkip = options.skip || false;
    this.markedOnly = options.only || false;

    this.options = options;
  }

  toString () {
    return this.name
  }

  /**
   * Add a test.
   * @return {module:test-object-model}
   */
  test (name, testFn, options) {
    /* validation */
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
   * @return {module:test-object-model}
   */
  skip (name, testFn, options) {
    options = options || {};
    options.skip = true;
    const test = this.test(name, testFn, options);
    return test
  }

  /**
   * Add an only test
   * @return {module:test-object-model}
   */
  only (name, testFn, options) {
    options = options || {};
    options.only = true;
    const test = this.test(name, testFn, options);
    return test
  }

  _onlyExists () {
    return Array.from(this.root()).some(t => t.markedOnly)
  }

  _skipLogic () {
    if (this._onlyExists()) {
      for (const test of this.root()) {
        test.markedSkip = !test.markedOnly;
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
   * @fulfil {*}
   */
  async run () {
    if (this.testFn) {
      if (this.markedSkip) {
        this.setState('skipped', this);
      } else {
        this.setState('in-progress', this);
        this.emit('start');

        try {
          const testResult = this.testFn.call(new TestContext({
            name: this.name,
            index: this.index
          }));
          if (isPromise(testResult)) {
            try {
              const result = await Promise.race([testResult, raceTimeout(this.timeout)]);
              this.result = result;
              this.setState('pass', this, result);
              return result
            } catch (err) {
              this.setState('fail', this, err);
              return Promise.reject(err)
            }
          } else {
            this.result = testResult;
            this.setState('pass', this, testResult);
            return testResult
          }
        } catch (err) {
          this.setState('fail', this, err);
          throw (err)
        }
      }
    } else {
      this.setState('ignored', this);
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
      this.resetState();
      this.markedSkip = this.options.skip || false;
      this.markedOnly = this.options.only || false;
    }
  }

  /**
   * If more than one TOM instances are supplied, combine them into a common root.
   * @param {Array.<Tom>} tests
   * @param {string} [name]
   * @return {Tom}
   */
  static combine (tests, name, options) {
    let test;
    if (tests.length > 1) {
      test = new this(name, options);
      for (const subTom of tests) {
        this.validate(subTom);
        test.add(subTom);
      }
    } else {
      test = tests[0];
      this.validate(test);
    }
    test._skipLogic();
    return test
  }

  static validate (tom = {}) {
    const valid = ['name', 'testFn', 'index', 'ended'].every(prop => Object.keys(tom).includes(prop));
    if (!valid) {
      const err = new Error('Valid TOM required');
      err.invalidTom = tom;
      throw err
    }
  }
}

function isPlainObject (input) {
  return input !== null && typeof input === 'object' && input.constructor === Object
}

/**
 * @module test-runner-core
 */

/**
 * @alias module:test-runner-core
 * @param {TestObjectModel} tom
 * @param {object} [options]
 * @param {function} [options.view] - View instance.
 * @param {boolean} [options.debug]
 * @emits start
 * @emits end
 */
class TestRunnerCore extends StateMachine {
  constructor (tom, options = {}) {

    /* validation */
    Tom.validate(tom);

    super('pending', [
      { from: 'pending', to: 'in-progress' },
      { from: 'in-progress', to: 'pass' },
      { from: 'in-progress', to: 'fail' }
    ]);

    /**
     * State machine: pending -> in-progress -> pass or fail
     * @member {string} module:test-runner-core#state
     */

    this.options = options;

    /**
     * Test Object Model
     * @type {TestObjectModel}
     */
    this.tom = tom;

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
    if (this.view) {
      this.view.runner = this;
    }

    /**
     * Runner stats
     */
    this.stats = new Stats();

    this.on('start', (...args) => {
      if (this.view && this.view.start) this.view.start(...args);
    });
    this.on('end', (...args) => {
      if (this.view && this.view.end) this.view.end(...args);
    });
    this.on('test-start', (...args) => {
      if (this.view && this.view.testStart) this.view.testStart(...args);
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

    /* translate tom to runner events */
    this.tom.on('start', (...args) => {
      this.emit('test-start', ...args);
    });
    this.tom.on('pass', (...args) => {
      this.stats.pass++;
      this.emit('test-pass', ...args);
    });
    this.tom.on('fail', (...args) => {
      this.stats.fail++;
      this.emit('test-fail', ...args);
    });
    this.tom.on('skipped', (...args) => {
      this.stats.skip++;
      this.emit('test-skip', ...args);
    });
    this.tom.on('ignored', (...args) => {
      this.stats.ignore++;
      this.emit('test-ignore', ...args);
    });
  }

  async runTomAndChildren (tom) {
    /* create array of job functions */
    const tests = [...tom.children];
    const jobs = tests.map(test => {
      return () => {
        const promise = test.run()
          .catch(err => {
            /**
             * Test suite failed
             * @event module:test-runner-core#fail
             */
            this.state = 'fail';
            if (this.options.debug) {
              console.error('-----------------------\nDEBUG');
              console.error('-----------------------');
              console.error(err);
              console.error('-----------------------');
            }
          });
        return Promise.all([promise, this.runTomAndChildren(test)])
      }
    });

    return new Promise((resolve, reject) => {
      /* isomorphic nextTick */
      setTimeout(async () => {
        const queue = new Queue(jobs, tom.maxConcurrency);
        await queue.process();
        resolve();
      }, 0);
    })
  }

  /**
   * Start the runner
   * @returns {Promise}
   * @fulfil {Array<Array>} - Fulfils with an array of arrays containing results for each batch of concurrently run tests.
   */
  async start () {
    this.stats.start = Date.now();

    /* encapsulate this as a TOM method? */
    const testCount = Array.from(this.tom).filter(t => t.testFn).length;
    this.stats.total = testCount;

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
    await this.runTomAndChildren(this.tom);
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
  }
}

export default TestRunnerCore;
