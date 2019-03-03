import StateMachine from './node_modules/fsm-base/dist/index.mjs'
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
    }

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

    this.tom.on('pass', (...args) => {
      this.stats.pass++
      this.emit('test-pass', ...args)
    })
    this.tom.on('fail', (...args) => {
      this.stats.fail++
      this.emit('test-fail', ...args)
    })
    this.tom.on('skip', (...args) => {
      this.stats.skip++
      this.emit('test-skip', ...args)
    })
    this.tom.on('ignored', (...args) => {
      this.stats.ignore++
      this.emit('test-ignore', ...args)
    })
  }

  /**
   * Start the runner
   * @returns {Promise}
   */
  async start () {
    this.stats.start = Date.now()
    const tests = Array.from(this.tom)

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
          // if (err.code !== 'ERR_ASSERTION') {
          //   console.error('TEST ERROR')
          //   console.error(err)
          // }
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
        this.stats.end = Date.now()
        this.emit('end', this.stats)
        return resolve(results)
      }, 0)
    })
  }
}

export default TestRunnerCore
