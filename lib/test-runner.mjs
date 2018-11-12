import Test from './test.mjs'
import Emitter from '../node_modules/obso/emitter.mjs'

/**
 * @module test-runner
 */

/**
 * @alias module:test-runner
 */
class TestRunner extends Emitter {
  constructor (options) {
    super()
    this.options = options || {}
    this.state = 0
    this._id = 1
    this.name = options.name
    this.tests = []
    this.init()
  }

  init () {
    this.on('start', count => console.log(`1..${count}`))
    this.on('test-pass', test => console.log(`ok ${test.id} ${test.name}`))
    this.on('test-fail', test => console.log(`not ok ${test.id} ${test.name}`))
    if (!this.options.manualStart) {
      process.setMaxListeners(Infinity)
      process.on('beforeExit', () => {
        this.start()
      })
    }
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
    if (this.state !== 0) return
    this.state = 1
    this.emit('start', this.tests.length)
    return Promise
      .all(this.tests.map(test => {
        this.emit('test-start', test)
        return test.run()
          .then(result => {
            this.emit('test-pass', test)
            this.emit('test-end', test)
            return result
          })
          .catch(err => {
            this.emit('test-fail', test)
            this.emit('test-end', test)
            throw err
          })
      }))
      .then(results => {
        this.state = 2
        this.emit('end')
        return results
      })
      .catch(err => {
        process.exitCode = 1
        this.state = 2
        this.emit('end')
        throw err
      })
  }
}

export default TestRunner
