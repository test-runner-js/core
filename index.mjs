import Test from './lib/test.mjs'
import Emitter from './node_modules/obso/emitter.mjs'

/**
 * @module test-runner
 */

class DefaultView {
  start (count) {
    console.log(`Starting: ${count} tests`)
  }
  testPass (test, result) {
    console.log('✓', test.name, result || 'ok')
  }
  testSkip (test) {
    console.log('-', test.name)
  }
  testFail (test, err) {
    console.log('⨯', test.name)
    console.log(err)
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
    options = options || {}
    this.options = options
    this.state = 0
    this.name = options.name
    this.tests = []
    this._only = []
    this.view = options.view || new DefaultView()
    this._beforeExitCallback = this.beforeExit.bind(this)
    this.manualStart = options.manualStart
  }

  set manualStart (val) {
    if (val) {
      process.removeListener('beforeExit', this._beforeExitCallback)
    } else {
      process.setMaxListeners(Infinity)
      process.on('beforeExit', this._beforeExitCallback)
    }
  }

  get manualStart () {
    return this._manualStart
  }

  removeAll (eventNames) {
    if (!(this._listeners && this._listeners.length)) return
    for (const eventName of eventNames) {
      let l
      while (l = this._listeners.find(l => l.eventName === eventName)) {
        this._listeners.splice(this._listeners.indexOf(l), 1)
      }
    }
  }

  set view (val) {
    this._view = val
    this.removeAll([ 'start', 'test-pass', 'test-fail', 'test-skip' ])
    if (this.view) {
      if (this.view.start) this.on('start', this.view.start.bind(this.view))
      if (this.view.testPass) this.on('test-pass', this.view.testPass.bind(this.view))
      if (this.view.testFail) this.on('test-fail', (test, err) => {
        process.exitCode = 1
        this.view.testFail(test, err)
      })
      if (this.view.testSkip) this.on('test-skip', this.view.testSkip.bind(this.view))
    }
  }

  get view () {
    return this._view
  }

  beforeExit () {
    this.start()
      // .catch(err => {
      //   /* start() should never reject as test failures are caught */
      //   if (err.code === 'ERR_ASSERTION') {
      //     console.log('ERR_ASSERTION caught')
      //   } else {
      //     console.error(require('util').inspect(err, { depth: 6, colors: true }))
      //   }
      // })
  }

  test (name, testFn, options) {
    const test = new Test(name, testFn, options)
    this.tests.push(test)
    test.index = this.tests.length
    return test
  }

  skip (name, testFn, options) {
    const test = this.test(name, testFn, options)
    test.skip = true
    return test
  }

  only (name, testFn, options) {
    const test = this.test(name, testFn, options)
    test.only = true
    this._only.push(test)
    return test
  }

  /**
   * Run all tests in parallel
   * @returns {Promise}
   */
  start () {
    if (this.state !== 0) return Promise.resolve()
    this.state = 1
    if (this._only.length) {
      for (const test of this.tests) {
        if (this._only.indexOf(test) === -1) test.skip = true
      }
    }
    const tests = this.tests
    this.emit('start', tests.length)
    if (this.options.sequential) {
      return new Promise((resolve, reject) => {
        const run = () => {
          const test = tests.shift()
          if (test.skip) {
            this.emit('test-skip', test)
            if (tests.length) {
              run()
            } else {
              resolve()
            }
          } else {
            test.run()
              .then(result => {
                try {
                  this.emitPass(test, result)
                  if (tests.length) {
                    run()
                  } else {
                    resolve()
                  }
                } catch (err) {
                  reject(err)
                }
              })
              .catch(err => {
                try {
                  this.emitFail(test, err)
                  if (tests.length) {
                    run()
                  } else {
                    resolve()
                  }
                } catch (err) {
                  reject(err)
                }
              })
          }
        }
        run()
      })
    } else {
      return Promise
        .all(tests.map(test => {
          if (test.skip) {
            this.emit('test-skip', test)
          } else {
            this.emit('test-start', test)
            return test.run()
              .then(result => {
                this.emitPass(test, result)
                return result
              })
              .catch(err => {
                this.emitFail(test, err)
              })
          }
        }))
        .then(results => {
          this.state = 2
          this.emit('end')
          return results
        })
        .catch(err => {
          this.state = 2
          this.emit('end')
          throw err
        })
    }
  }

  emitPass (test, result) {
    this.emit('test-pass', test, result)
    this.emit('test-end', test, result)
  }
  emitFail (test, err) {
    this.emit('test-fail', test, err)
    this.emit('test-end', test, err)
  }

  clear () {
    this.tests = []
    this._only = []
  }
}

export default TestRunner
