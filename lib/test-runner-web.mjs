import TestRunner from './test-runner.mjs'

/**
 * @module test-runner-web
 */

/**
 * @alias module:test-runner-web
 */
class TestRunnerWeb extends TestRunner {
  init () {
    this.on('start', count => console.log(`1..${count}`))
    this.on('test-pass', test => console.log(`ok ${test.id} ${test.name}`))
    this.on('test-fail', test => console.log(`not ok ${test.id} ${test.name}`))
    if (!this.options.manualStart) {
      window.onload = () => {
        this.start()
      }
    }
  }
}

export default TestRunnerWeb
