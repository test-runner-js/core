import StateMachine from './node_modules/fsm-base/index.mjs'
import ViewBase from './lib/view-base.mjs'
import Queue from './lib/queue.mjs'
import { performance } from 'perf_hooks'

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
    options = options || {}
    if (!options.tom) throw new Error('tom required')
    super([
      { from: undefined, to: 'pending' },
      { from: 'pending', to: 'in-progress' },
      { from: 'in-progress', to: 'pass' },
      { from: 'in-progress', to: 'fail' }
    ])

    /**
     * State machine: pending -> in-progress -> pass or fail
     * @type {string}
     */
    this.state = 'pending'
    this.options = options

    /**
     * Test Object Model
     * @type {TestObjectModel}
     */
    this.tom = options.tom
    if (options.view) {
      const ViewClass = options.view(ViewBase)
      this.view = new ViewClass()
    }

    /**
     * Ended flag
     * @type {boolean}
     */
    this.ended = false

    this.tom.on('pass', (...args) => this.emit('test-pass', ...args))
    this.tom.on('fail', (...args) => this.emit('test-fail', ...args))
    this.tom.on('skip', (...args) => this.emit('test-skip', ...args))

    this.stats = {
      start: 0,
      end: 0
    }
  }

  /**
   * View
   * @type {function}
   */
  set view (view) {
    if (view) {
      if (this._view) this._view.detach()
      this._view = view
      this._view.attach(this)
    } else {
      if (this._view) this._view.detach()
      this._view = null
    }
  }

  get view () {
    return this._view
  }

  /**
   * Start the runner
   * @returns {Promise}
   */
  async start () {
    this.stats.start = performance.now()
    const tests = Array.from(this.tom).filter(t => t.testFn)

    /**
     * in-progress
     * @event module:test-runner-core#in-progress
     * @param testCount {number} - the numbers of tests
     */
    this.setState('in-progress', tests.length)

    /**
     * Start
     * @event module:test-runner-core#start
     * @param testCount {number} - the numbers of tests
     */
    this.emit('start', tests.length)

    const jobs = tests.map(test => {
      return () => {
        return test.run().catch(err => {
          /**
           * Test suite failed
           * @event module:test-runner-core#fail
           */
          this.state = 'fail'
          // keep going when tests fail but crash for programmer error
        })
      }
    })
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const queue = new Queue(jobs, this.tom.options.concurrency)
        const results = []
        for await (const result of queue) {
          results.push(result)
        }
        this.ended = true
        if (this.state !== 'fail') {
          /**
           * Test suite passed
           * @event module:test-runner-core#pass
           */
          this.state = 'pass'
        }
        /**
         * Test suite ended
         * @event module:test-runner-core#end
         */
        this.stats.end = performance.now()
        this.emit('end')
        return resolve(results)
      }, 0)
    })
  }
}

export default TestRunnerCore
