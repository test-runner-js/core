import StateMachine from './node_modules/fsm-base/dist/index.mjs'
import Queue from './lib/queue.mjs'
import Stats from './lib/stats.mjs'
import TOM from './node_modules/test-object-model/dist/index.mjs'

/**
 * @module test-runner-core
 */

/**
 * @alias module:test-runner-core
 * @param {TestObjectModel} tom
 * @param {object} [options]
 * @param {function} [options.view]
 * @emits start
 * @emits end
 */
class TestRunnerCore extends StateMachine {
  constructor (tom, options = {}) {

    /* validation */
    TOM.validate(tom)

    super('pending', [
      { from: 'pending', to: 'in-progress' },
      { from: 'in-progress', to: 'pass' },
      { from: 'in-progress', to: 'fail' }
    ])

    /**
     * State machine: pending -> in-progress -> pass or fail
     * @member {string} module:test-runner-core#state
     */

    this.options = options

    /**
     * Test Object Model
     * @type {TestObjectModel}
     */
    this.tom = tom

    /**
     * Ended flag
     * @type {boolean}
     */
    this.ended = false

    /**
     * View
     * @type {View}
     */
    this.view = options.view

    /**
     * Runner stats
     */
    this.stats = new Stats()

    this.on('start', (...args) => {
      if (this.view && this.view.start) this.view.start(...args)
    })
    this.on('end', (...args) => {
      if (this.view && this.view.end) this.view.end(...args)
    })
    this.on('test-pass', (...args) => {
      if (this.view && this.view.testPass) this.view.testPass(...args)
    })
    this.on('test-fail', (...args) => {
      if (this.view && this.view.testFail) this.view.testFail(...args)
    })
    this.on('test-skip', (...args) => {
      if (this.view && this.view.testSkip) this.view.testSkip(...args)
    })
    this.on('test-ignore', (...args) => {
      if (this.view && this.view.testIgnore) this.view.testIgnore(...args)
    })

    /* translate tom to runner events */
    this.tom.on('pass', (...args) => {
      this.stats.pass++
      this.emit('test-pass', ...args)
    })
    this.tom.on('fail', (...args) => {
      this.stats.fail++
      this.emit('test-fail', ...args)
    })
    this.tom.on('skipped', (...args) => {
      this.stats.skip++
      this.emit('test-skip', ...args)
    })
    this.tom.on('ignored', (...args) => {
      this.stats.ignore++
      this.emit('test-ignore', ...args)
    })
  }

  async runTomAndChildren (tom) {
    /* create array of job functions */
    const tests = [...tom.children]
    const jobs = tests.map(test => {
      return () => {
        const promise = test.run()
          .catch(err => {
            /**
             * Test suite failed
             * @event module:test-runner-core#fail
             */
            this.state = 'fail'
            // don't handle err - keep going when tests fail (but crash for programmer error if poss)
          })
        return Promise.all([promise, this.runTomAndChildren(test)])
      }
    })

    return new Promise((resolve, reject) => {
      /* isomorphic nextTick */
      setTimeout(async () => {
        const queue = new Queue(jobs, tom.maxConcurrency)
        await queue.process()
        resolve()
      }, 0)
    })
  }

  /**
   * Start the runner
   * @returns {Promise}
   * @fulfil {Array<Array>} - Fulfils with an array of arrays containing results for each batch of concurrently run tests.
   */
  async start () {
    this.stats.start = Date.now()

    /* encapsulate this as a TOM method? */
    const testCount = Array.from(this.tom).filter(t => t.testFn).length

    /**
     * in-progress
     * @event module:test-runner-core#in-progress
     * @param testCount {number} - the numbers of tests
     */
    this.setState('in-progress', testCount)

    /**
     * Start
     * @event module:test-runner-core#start
     * @param testCount {number} - the numbers of tests
     */
    this.emit('start', testCount)
    await this.runTomAndChildren(this.tom)
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
    this.stats.end = Date.now()
    this.emit('end', this.stats)
  }
}

class RunTestCommand {
  constructor (test) {
    this.test = test
  }

  execute () {
    return this.test.run()
  }
}

export default TestRunnerCore
