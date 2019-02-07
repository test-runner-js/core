import consoleView from './lib/view-default.mjs'
import StateMachine from './node_modules/fsm-base/index.mjs'
import ViewBase from './lib/view-base.mjs'
import Queue from './lib/queue.mjs'

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
class TestRunner extends StateMachine {
  constructor (options) {
    options = options || {}
    if (!options.tom) throw new Error('tom required')
    super([
      { from: undefined, to: 'pending' },
      { from: 'pending', to: 'in-progress' },
      { from: 'in-progress', to: 'pass' },
      { from: 'in-progress', to: 'fail' }
    ])
    this.state = 'pending'
    this.options = options
    this.tom = options.tom
    if (options.view) {
      const ViewClass = options.view(ViewBase)
      this.view = new ViewClass()
    }
    this.ended = false
  }

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
        this.emit('end')
        return resolve(results)
      }, 0)
    })
  }
}

export default TestRunner
