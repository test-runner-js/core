import consoleView from './lib/view-default.mjs'
import StateMachine from './node_modules/fsm-base/index.mjs'
import ViewBase from './lib/view-base.mjs'
import Queue from './lib/queue.mjs'

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
    options = options || {}
    if (!options.tom) throw new Error('tom required')
    super([
      { from: undefined, to: 'pending' },
      { from: 'pending', to: 'start' },
      { from: 'start', to: 'pass' },
      { from: 'start', to: 'fail' },
      { from: 'pass', to: 'end' },
      { from: 'fail', to: 'end' }
    ])
    this.state = 'pending'
    this.options = options
    this.tom = options.tom
    const ViewClass = (options.view || consoleView)(ViewBase)
    this.view = new ViewClass()
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

  async start () {
    return new Promise((resolve, reject) => {
      const tests = Array.from(this.tom).filter(t => t.testFn)
      this.setState('start', tests.length)
      const jobs = tests.map(test => {
        return () => {
          return test.run()
            .catch(err => {
              this.state = 'fail'
              // keep going when tests fail but crash for programmer error
            })
        }
      })
      setTimeout(async () => {
        const queue = new Queue(jobs, this.tom.options.concurrency)
        const results = []
        for await (const result of queue) {
          results.push(result)
        }
        if (this.state !== 'fail') this.state = 'pass'
        this.state = 'end'
        return resolve(results)
      }, 0)
    })
  }
}

export default TestRunner
