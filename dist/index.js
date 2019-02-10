(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.TestRunner = factory());
}(this, function () { 'use strict';

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

      /**
       * in-progress
       * @event module:test-runner-core#in-progress
       * @param testCount {number} - the numbers of tests
       */
      this.setState('in-progress', tests.length);

      /**
       * Start
       * @event module:test-runner-core#start
       * @param testCount {number} - the numbers of tests
       */
      this.emit('start', tests.length);

      const jobs = tests.map(test => {
        return () => {
          return test.run().catch(err => {
            /**
             * Test suite failed
             * @event module:test-runner-core#fail
             */
            this.state = 'fail';
            // keep going when tests fail but crash for programmer error
          })
        }
      });
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          const queue = new Queue(jobs, this.tom.options.concurrency);
          const results = [];
          for await (const result of queue) {
            results.push(result);
          }
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

  return TestRunnerCore;

}));
