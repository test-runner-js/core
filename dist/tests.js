'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var a = _interopDefault(require('assert'));
var http = _interopDefault(require('http'));
var fetch = _interopDefault(require('node-fetch'));

var consoleView = ViewBase => class ConsoleView extends ViewBase {
  start (count) {
    this.log(`Starting: ${count} tests`);
  }
  testPass (test, result) {
    this.log('✓', test.name, result || 'ok');
  }
  testSkip (test) {
    this.log('-', test.name);
  }
  testFail (test, err) {
    this.log(`⨯ ${test.name} [Error: ${err.message}]`);
  }
  end () {
    this.log(`End`);
  }
};

/**
 * @module obso
 */

/**
 * @alias module:obso
 */
class Emitter {
  /**
   * Emit an event.
   * @param {string} [eventName] - the event name to emit, omitting the name will catch all events.
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
    if (this.parent) this.parent.emitTarget(eventName, this, ...args);
  }

  emitTarget (eventName, target, ...args) {
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
    if (this.parent) this.parent.emitTarget(eventName, target || this, ...args);
  }

   /**
    * Register an event listener.
    * @param {string} eventName - the event name to watch
    * @param {function} handler - the event handler
    * @param {object} [options]
    * @param {boolean} [options.once]
    */
  on (eventName, handler, options) {
    createListenersArray(this);
    options = options || {};
    if (arguments.length === 1 && typeof eventName === 'function') {
      handler = eventName;
      eventName = '__ALL__';
    }
    this._listeners.push({ eventName, handler: handler, once: options.once });
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
      runner.tom.on('pass', this._callback.testPass);
      runner.tom.on('fail', this._callback.testFail);
      runner.tom.on('skip', this._callback.testSkip);
      this.attachedTo = runner;
    }
  }

  detach () {
    if (this.attachedTo && this._callback) {
      this.attachedTo.removeEventListener('start', this._callback.start);
      this.attachedTo.removeEventListener('end', this._callback.end);
      this.attachedTo.tom.removeEventListener('pass', this._callback.testPass);
      this.attachedTo.tom.removeEventListener('fail', this._callback.testFail);
      this.attachedTo.tom.removeEventListener('skip', this._callback.testSkip);
      this.attachedTo = null;
    }
  }

  log () {
    console.log(...arguments);
  }
  start (count) {
    throw new Error('not implemented')
  }
  end () {
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

class Queue {
  constructor (jobs, maxConcurrency) {
    this.jobs = jobs;
    this.activeCount = 0;
    this.maxConcurrency = maxConcurrency || 10;
  }

  async * [Symbol.asyncIterator] () {
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
        for (const result of results) {
          yield result;
        }
      }
    }
  }
}

/**
 * @module test-runner
 */

/**
 * @alias module:test-runner
 @ @param {object} [options]
 @ @param {function} [options.view]
 @ @param {object} [options.tom]
 * @emits start
 * @emits end
 */
class TestRunner extends StateMachine {
  constructor (options) {
    options = options || {};
    if (!options.tom) throw new Error('tom required')
    super([
      { from: undefined, to: 'pending' },
      { from: 'pending', to: 'start' },
      { from: 'start', to: 'pass' },
      { from: 'start', to: 'fail' },
      { from: 'pass', to: 'end' },
      { from: 'fail', to: 'end' }
    ]);
    this.state = 'pending';
    this.options = options;
    this.tom = options.tom;
    const ViewClass = (options.view || consoleView)(ViewBase);
    this.view = new ViewClass();
  }

  set view (view) {
    if (view) {
      if (this._view) this._view.detach();
      this._view = view;
      this._view.attach(this);
    } else {
      if (this._view) this._view.detach();
      this._view = null;
    }
  }

  get view () {
    return this._view
  }

  async start () {
    return new Promise((resolve, reject) => {
      const tests = Array.from(this.tom).filter(t => t.testFn);
      this.setState('start', tests.length);
      const jobs = tests.map(test => {
        return () => {
          return test.run()
            .catch(err => {
              this.state = 'fail';
              // keep going when tests fail but crash for programmer error
            })
        }
      });
      setTimeout(async () => {
        const queue = new Queue(jobs, this.tom.options.concurrency);
        const results = [];
        for await (const result of queue) {
          results.push(result);
        }
        if (this.state !== 'fail') this.state = 'pass';
        this.state = 'end';
        return resolve(results)
      }, 0);
    })
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
   * @param {string} [eventName] - the event name to emit, omitting the name will catch all events.
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
    if (this.parent) this.parent.emitTarget(eventName, this, ...args);
  }

  emitTarget (eventName, target, ...args) {
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
    if (this.parent) this.parent.emitTarget(eventName, target || this, ...args);
  }

   /**
    * Register an event listener.
    * @param {string} eventName - the event name to watch
    * @param {function} handler - the event handler
    * @param {object} [options]
    * @param {boolean} [options.once]
    */
  on (eventName, handler, options) {
    createListenersArray$1(this);
    options = options || {};
    if (arguments.length === 1 && typeof eventName === 'function') {
      handler = eventName;
      eventName = '__ALL__';
    }
    this._listeners.push({ eventName, handler: handler, once: options.once });
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
 * Test function class.
 * @param {string} name
 * @param {function} testFn
 * @param {object} [options]
 * @param {number} [options.timeout]
 */
class Test extends createMixin(Composite)(StateMachine$1) {
  constructor (name, testFn, options) {
    if (typeof name === 'string') ; else if (typeof name === 'function') {
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
      { from: 'pending', to: 'start' },
      { from: 'pending', to: 'skip' },
      { from: 'start', to: 'pass' },
      { from: 'start', to: 'fail' },
      /* reset */
      { from: 'start', to: 'pending' },
      { from: 'pass', to: 'pending' },
      { from: 'fail', to: 'pending' },
      { from: 'skip', to: 'pending' },
    ]);
    this.name = name;
    this.testFn = testFn;
    this.options = Object.assign({ timeout: 10000 }, options);
    this.index = 1;
    this.state = 'pending';
    this._markSkip = options._markSkip;
    this._skip = null;
    this._only = options.only;
  }

  toString () {
    return `${this.name}`
  }

  test (name, testFn, options) {
    for (const child of this) {
      if (child.name === name) {
        throw new Error('Duplicate name: ' + name)
      }
    }
    const test = new this.constructor(name, testFn, options);
    this.add(test);
    test.index = this.children.length;
    this.skipLogic();
    return test
  }

  onlyExists () {
    return Array.from(this.root()).some(t => t._only)
  }

  skipLogic () {
    if (this.onlyExists()) {
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

  skip (name, testFn, options) {
    options = options || {};
    options._markSkip = true;
    const test = this.test(name, testFn, options);
    return test
  }

  only (name, testFn, options) {
    options = options || {};
    options.only = true;
    const test = this.test(name, testFn, options);
    return test
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
        this.state = 'start';
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
      return Promise.resolve()
    }
  }

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

  static combine (toms, name) {
    if (toms.length > 1) {
      const tom = new this(name);
      for (const subTom of toms) {
        tom.add(subTom);
      }
      return tom
    } else {
      return toms[0]
    }
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

function halt (err) {
  console.log(err);
  process.exitCode = 1;
}

{ /* new TestRunner: no tom */
  try {
    const runner = new TestRunner();
  } catch (err) {
    if (!/tom required/i.test(err.message)) halt(err);
  }
}

{ /* runner states: pass */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => 1);
  tom.on('pass', () => counts.push('test-pass'));
  tom.on('fail', () => counts.push('test-fail'));

  const runner = new TestRunner({ tom });
  runner.on('pass', () => counts.push(runner.state));
  runner.on('fail', () => counts.push(runner.state));
  counts.push(runner.state);
  runner.start()
    .then(() => {
      counts.push(runner.state);
      a.deepStrictEqual(counts, [ 'pending', 'start', 'test-pass', 'pass', 'end' ]);
    })
    .catch(halt);
  counts.push(runner.state);
}

{ /* runner states: fail */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => {
    throw new Error('broken')
  });
  tom.on('pass', () => counts.push('test-pass'));
  tom.on('fail', () => counts.push('test-fail'));

  const runner = new TestRunner({ tom });
  runner.on('pass', () => counts.push(runner.state));
  runner.on('fail', () => counts.push(runner.state));
  counts.push(runner.state);
  runner.start()
    .then(() => {
      counts.push(runner.state);
      a.deepStrictEqual(counts, [ 'pending', 'start', 'test-fail', 'fail', 'end' ]);
    })
    .catch(halt);
  counts.push(runner.state);
}

{ /* runner states: fail, reject */
  let counts = [];
  const tom = new Test();
  tom.test('one', function () {
    return Promise.reject(new Error('broken'))
  });
  tom.on('pass', () => counts.push('test-pass'));
  tom.on('fail', () => counts.push('test-fail'));

  const runner = new TestRunner({ tom });
  runner.on('pass', () => counts.push(runner.state));
  runner.on('fail', () => counts.push(runner.state));
  counts.push(runner.state);
  runner.start()
    .then(() => {
      counts.push(runner.state);
      a.deepStrictEqual(counts, [ 'pending', 'start', 'test-fail', 'fail', 'end' ]);
    })
    .catch(halt);
  counts.push(runner.state);
}

{ /* runner.start(): pass results and events */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => {
    counts.push('one');
    return 1
  });
  tom.test('two', () => {
    counts.push('two');
    return 2
  });

  const runner = new TestRunner({ tom });
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [ 1, 2 ]);
      a.deepStrictEqual(counts, [ 'one', 'two' ]);
    })
    .catch(halt);
}

{ /* runner.start(): fail results and events */
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

  const runner = new TestRunner({ tom });
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [ undefined, undefined ]);
      a.deepStrictEqual(counts, [ 'one', 'two' ]);
    })
    .catch(halt);
}

{ /* runner.start(): pass, fail, skip events */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => true);
  tom.test('two', () => { throw new Error('fail') });
  tom.skip('three', () => true);

  const runner = new TestRunner({ tom });
  runner.tom.on('pass', () => counts.push('pass'));
  runner.tom.on('fail', () => counts.push('fail'));
  runner.tom.on('skip', () => counts.push('skip'));
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'pass', 'fail', 'skip' ]);
    })
    .catch(halt);
}

{ /* runner.start(): only */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => 1);
  tom.test('two', () => 2);
  tom.only('three', () => 3);

  const runner = new TestRunner({ tom });
  runner.tom.on('pass', () => counts.push('pass'));
  runner.tom.on('fail', () => counts.push('fail'));
  runner.tom.on('skip', () => counts.push('skip'));
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [ undefined, undefined, 3 ]);
      a.deepStrictEqual(counts, [ 'skip', 'skip', 'pass' ]);
    })
    .catch(halt);
}

{ /* runner.start(): deep only */
  let counts = [];
  const tom = new Test();
  const one = tom.only('one', () => 1);
  const two = one.test('two', () => 2);
  const three = two.only('three', () => 3);

  const runner = new TestRunner({ tom });
  runner.tom.on('pass', () => counts.push('pass'));
  runner.tom.on('fail', () => counts.push('fail'));
  runner.tom.on('skip', () => counts.push('skip'));
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [ 1, undefined, 3 ]);
      a.deepStrictEqual(counts, [ 'pass', 'skip', 'pass' ]);
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

  const runner = new TestRunner({ tom });
  runner.tom.on('pass', () => counts.push('pass'));
  runner.tom.on('fail', () => counts.push('fail'));
  runner.tom.on('skip', () => counts.push('skip'));
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [ 1, undefined, undefined ]);
      a.deepStrictEqual(counts, [ 'pass', 'skip', 'fail' ]);
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

  const runner = new TestRunner({ tom });
  runner.tom.on('pass', () => counts.push('pass'));
  runner.tom.on('fail', () => counts.push('fail'));
  runner.tom.on('skip', () => counts.push('skip'));
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [ 1, undefined, undefined ]);
      a.deepStrictEqual(counts, [ 'pass', 'skip', 'skip' ]);
    })
    .catch(halt);
}

function halt$1 (err) {
  console.log(err);
  process.exitCode = 1;
}

{ /* custom view */
  let counts = [];
  const tom = new Test();
  tom.test('one', () => counts.push('one'));
  tom.test('two', () => counts.push('two'));

  const view = ViewBase => class extends ViewBase {
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
  };

  const runner = new TestRunner({ view, tom });
  runner.start()
    .then(() => a.deepStrictEqual(counts, [ 'start', 'one', 'testPass', 'two', 'testPass', 'end' ]))
    .catch(halt$1);
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

  const runner = new TestRunner({ tom });
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [ 1, 2, 3 ]);
      a.deepStrictEqual(counts, [ 1, 2, 3 ]);
    })
    .catch(halt);
}

{ /* server tests */
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

  const runner = new TestRunner({ tom });
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [ 200, 201 ]);
      a.deepStrictEqual(counts, [ 200, 201 ]);
    })
    .catch(halt);
}
