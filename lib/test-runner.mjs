import Test from './test.mjs'
import { EventEmitter } from 'events'

/**
 * @module test-runner
 */

/**
 * @alias module:test-runner
 */
class TestRunner extends EventEmitter {
  constructor () {
    super()
    this._id = 1
    this.tests = []
  }

  test (name, testFn, options) {
    const t = new Test(name, testFn, options)
    t.id = this._id++
    this.tests.push(t)
  }

  /**
   * Run all tests in parallel
   */
  start () {
    this.emit('start', this.tests.length)
    return Promise
      .all(this.tests.map(test => {
        this.emit('test-start', test)
        return test.run()
          .then(result => {
            this.emit('test-end', test)
            return result
          })
          .catch(err => {
            this.emit('test-end', test)
            throw err
          })
      }))
      .then(results => {
        this.emit('end')
        return results
      })
      .catch(err => {
        process.exitCode = 1
        this.emit('end')
        throw err
      })
  }
}

export default TestRunner
