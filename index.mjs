import Test from './lib/test.mjs'
import Emitter from './node_modules/obso/emitter.mjs'
import consoleView from './lib/view-default.mjs'
import mixin from './node_modules/create-mixin/index.mjs'
import StateMachine from './node_modules/fsm-base/index.mjs'
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
    super()
    this.tom = tom
  }

  start () {
    return this.runInParallel(this.tom)
  }

  runInParallel (tom) {
    return Promise.all(Array.from(tom).map(test => test.run()))
  }
}

export default TestRunner
