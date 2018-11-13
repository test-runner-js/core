import Test from './test.mjs'
import Emitter from '../node_modules/obso/emitter.mjs'

/**
 * @module test-runner
 */

class TAPView {
  start (count) {
    console.log(`1..${count}`)
  }
  testPass (test) {
    console.log(`ok ${test.id} ${test.name}`)
  }
  testFail (test) {
    console.log(`not ok ${test.id} ${test.name}`)
  }
}

/**
 * @alias module:test-runner
 * @emits start
 * @emits end
 * @emits test-start
 * @emits test-end
 * @emits test-pass
 * @emits test-fail
 */
class TestRunner extends Emitter {
  constructor (options) {
    super()
    this.options = options || {}
    this.state = 0
    this._id = 1
    this.name = options.name
    this.tests = []
    this.view = options.view || new TAPView()
    if (this.view.start) this.on('start', this.view.start.bind(this.view))
    if (this.view.testPass) this.on('test-pass', this.view.testPass.bind(this.view))
    if (this.view.testFail) this.on('test-fail', this.view.testFail.bind(this.view))
    this.init()
  }

  init () {
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
