import consoleView from './lib/view-default.mjs'
import StateMachine from './node_modules/fsm-base/index.mjs'
import ViewBase from './lib/view-base.mjs'

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
    super([
      { from: undefined, to: 'pending' },
      { from: 'pending', to: 'start' },
      { from: 'start', to: 'end' },
    ])
    this.state = 'pending'
    this.sequential = options.sequential
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

  start () {
    const count = Array.from(this.tom).length
    this.setState('start', count)
    if (this.sequential) {
      return this.runSequential().then(results => {
        this.state = 'end'
        return results
      })
    } else {
      return this.runInParallel().then(results => {
        this.state = 'end'
        return results
      })
    }
  }

  runInParallel () {
    return Promise.all(Array.from(this.tom).map(test => {
      return test.run()
        .catch(err => {
          // keep going when tests fail but crash for programmer error
        })
    }))
  }

  runSequential () {
    const results = []
    return new Promise((resolve, reject) => {
      const iterator = this.tom[Symbol.iterator]()
      function runNext () {
        const tom = iterator.next().value
        if (tom) {
          tom.run()
            .then(result => results.push(result))
            .catch(err => {
              // keep going when tests fail but crash for programmer error
            })
            .finally(() => runNext())
        } else {
          resolve(results)
        }
      }
      runNext()
    })
  }
}

export default TestRunner
