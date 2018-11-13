import TestRunner from './test-runner.mjs'

/**
 * @module test-runner-web
 */

/**
 * @alias module:test-runner-web
 */
class TestRunnerWeb extends TestRunner {
  init () {
    if (!this.options.manualStart) {
      window.onload = () => {
        this.start()
      }
    }
  }
}

export default TestRunnerWeb
