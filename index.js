import StateMachine from 'fsm-base'
import { Job, Queue } from 'work'
import Stats from './lib/stats.js'
import Tom from '@test-runner/tom'

/**
 * @module test-runner-core
 */

/**
 * A runner associates a TOM with a View. A runner organises TOM tests into a Work queue and executes them. The runner encapulates the opinion of how a TOM should be executed and displayed. Must be isomorphic.
 *
 * @alias module:test-runner-core
 * @param {TestObjectModel} tom
 * @param [options] {object} - Config object.
 * @param [options.view] {function} - View instance.
 */
class TestRunner extends StateMachine {
  options

  /**
   * Test Object Model
   * @type {TestObjectModel}
   */
  tom

  /**
   * Ended flag
   * @type {boolean}
   */
  ended = false /* TODO: make getter returning true if either pass or fail state */

  /**
   * View
   * @type {View}
   */
  view

  /**
   * Runner stats
   * @namespace
   * @property {number} fail
   * @property {number} pass
   * @property {number} skip
   * @property {number} start
   * @property {number} end
   */
  stats = new Stats()

  constructor (tom, options = {}) {
    Tom.validate(tom) //TODO: Should a TOM be validated when created instead of here? Will it avoid circ references?

    /* TODO: This should be the state of the _run_, not the runner.. */
    /**
     * State machine: pending -> in-progress -> pass or fail
     * @member {string} module:test-runner-core#state
     */
    super('pending', [
      { from: 'pending', to: 'in-progress' },
      { from: 'in-progress', to: 'pass' },
      { from: 'in-progress', to: 'fail' }
    ])

    this.options = options
    this.tom = tom
    this.view = options.view
    if (this.view) {
      this.view.runner = this /* TODO: Circular? Used by live-view. */
    }
    this.stats = new Stats()

    this.on('start', (...args) => {
      if (this.view && this.view.start) this.view.start(...args)
    })
    this.on('end', (...args) => {
      if (this.view && this.view.end) this.view.end(...args)
    })

    /* translate tom to runner events */
    this.tom.on('in-progress', (...args) => {
      this.stats.inProgress++ // TODO: move `.stats` to TOM - tom.stats returns event invocation counts
      /**
       * Test start.
       * @event module:test-runner-core#test-start
       * @param test {TestObjectModel} - The test node.
       */
      this.emit('test-start', ...args)
      if (this.view && this.view.testStart) this.view.testStart(...args)
    })
    this.tom.on('pass', (...args) => {
      this.stats.pass++
      this.stats.inProgress--
      /**
       * Test pass.
       * @event module:test-runner-core#test-pass
       * @param test {TestObjectModel} - The test node.
       * @param result {*} - The value returned by the test.
       */
      this.emit('test-pass', ...args)
      if (this.view && this.view.testPass) this.view.testPass(...args)
    })
    this.tom.on('fail', (...args) => {
      this.stats.fail++
      this.stats.inProgress--
      /**
       * Test fail.
       * @event module:test-runner-core#test-fail
       * @param test {TestObjectModel} - The test node.
       * @param err {Error} - The exception thrown by the test.
       */
      this.emit('test-fail', ...args)
      if (this.view && this.view.testFail) this.view.testFail(...args)
    })
    this.tom.on('skipped', (...args) => {
      this.stats.skip++
      /**
       * Test skip.
       * @event module:test-runner-core#test-skip
       * @param test {TestObjectModel} - The test node.
       */
      this.emit('test-skip', ...args)
      if (this.view && this.view.testSkip) this.view.testSkip(...args)
    })
    this.tom.on('ignored', (...args) => {
      this.stats.ignore++
      /**
       * Test ignore.
       * @event module:test-runner-core#test-ignore
       * @param test {TestObjectModel} - The test node.
       */
      this.emit('test-ignore', ...args)
      if (this.view && this.view.testIgnore) this.view.testIgnore(...args)
    })
    this.tom.on('todo', (...args) => {
      this.stats.todo++
      /**
       * Test todo.
       * @event module:test-runner-core#test-todo
       * @param test {TestObjectModel} - The test node.
       */
      this.emit('test-todo', ...args)
      if (this.view && this.view.testTodo) this.view.testTodo(...args)
    })
  }

  createWork (tom) {
    let node
    if (tom.type === 'test' || tom.type === 'todo') {
      node = new Job({
        fn: () => tom.run(),
        maxConcurrency: tom.options.maxConcurrency
      })
      node.name = tom.name
      node.onFail = new Job({
        fn: (err) => {
          if (err.isTestFail) {
            this.state = 'fail'
          } else {
            throw err
          }
        }
      })
    } else {
      tom.setState('ignored')
      node = new Queue({ maxConcurrency: 1 })
      const beforeJobs = tom.children.filter(t => t.options.before).map(t => this.createWork(t))
      const mainJobs = tom.children.filter(t => !(t.options.before || t.options.after)).map(t => this.createWork(t))
      const afterJobs = tom.children.filter(t => t.options.after).map(t => this.createWork(t))
      const beforeQueue = new Queue({ maxConcurrency: tom.options.maxConcurrency })
      for (const job of beforeJobs) {
        beforeQueue.add(job)
      }
      const mainQueue = new Queue({ maxConcurrency: tom.options.maxConcurrency })
      for (const job of mainJobs) {
        mainQueue.add(job)
      }
      const afterQueue = new Queue({ maxConcurrency: tom.options.maxConcurrency })
      for (const job of afterJobs) {
        afterQueue.add(job)
      }
      node.add(beforeQueue)
      node.add(mainQueue)
      node.add(afterQueue)
    }
    return node
  }

  async * eventStream () {

  }

  /**
   * Start the runner.
   */
  async start () {
    if (this.view && this.view.init) {
      await this.view.init()
    }
    this.stats.start = Date.now()

    /* encapsulate this as a Tom method? */
    const testCount = Array.from(this.tom).filter(t => t.testFn).length
    this.stats.total = testCount

    /**
     * in-progress
     * @event module:test-runner-core#in-progress
     * @param testCount {number} - the numbers of tests
     */
    this.setState('in-progress', testCount) /* TODO: why not pass the whole this.stats object, or pass nothing at all if the stats is available on `this`? */

    /**
     * Start
     * @event module:test-runner-core#start
     * @param testCount {number} - the numbers of tests
     */
    this.emit('start', testCount)
    const work = this.createWork(this.tom)
    await work.process()
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

export default TestRunner
