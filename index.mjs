import consoleView from './lib/view-default.mjs'
import StateMachine from 'fsm-base'
import ViewBase from './lib/view-base.mjs'

/**
 * @module test-runner
 */

/**
 * @alias module:test-runner
 * @emits start
 * @emits end
 * @emits test-start
 * @emits test-end
 * @emits test-pass
 * @emits test-fail
 */
class TestRunner extends StateMachine {
  constructor (tom, options) {
    options = options || {}
    super([
      { from: undefined, to: 'pending' },
      { from: 'pending', to: 'start' },
      { from: 'start', to: 'end' },
    ])
    this.state = 'pending'
    this.tom = tom
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
    this.state = 'start'
    return this.runInParallel(this.tom).then(results => {
      this.state = 'end'
      return results
    })
  }

  runInParallel (tom) {
    return Promise.all(Array.from(tom).map(test => test.run()))
  }
}

export default TestRunner
