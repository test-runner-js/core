import Test from './lib/test.mjs'
import Emitter from './node_modules/obso/emitter.mjs'
import ViewBase from './lib/view-base.mjs'
import ConsoleView from './lib/view-default.mjs'
import mixin from './node_modules/create-mixin/index.mjs'
import FsmBase from './node_modules/fsm-base/index.mjs'
import CompositeClass from './node_modules/composite-class/index.mjs'

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
class TestRunner extends mixin(CompositeClass)(FsmBase) {
  constructor (options) {
    super([
      { from: undefined, to: 0 },
      { from: 0, to: 1 },
      { from: 1, to: 2 },
    ])
    options = options || {}
    this.options = options
    this.state = 0
    this.name = options.name
    this.tests = []
    this._only = []
    this.view = options.view || new ConsoleView()
    this._beforeExitCallback = this.beforeExit.bind(this)
    this.autoStart = !options.manualStart
  }

  set autoStart (val) {
    this._autoStart = val
    if (val) {
      process.setMaxListeners(Infinity)
      process.on('beforeExit', this._beforeExitCallback)
    } else {
      process.removeListener('beforeExit', this._beforeExitCallback)
    }
  }

  get autoStart () {
    return this._autoStart
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

  set view (view) {
    if (view) {
      if (this._view) {
        this._view.detach()
      }
      this._view = view
      this._view.attach(this)
    } else {
      if (this._view) {
        this._view.detach()
      }
      this._view = null
    }
  }

  get view () {
    return this._view
  }

  beforeExit () {
    this.start()
  }

  test (name, testFn, options) {
    const test = new Test(name, testFn, options)
    this.add(test)
    test.index = this.children.length
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
   * Run all tests
   * @returns {Promise}
   */
  start () {
    if (this.state !== 0) return Promise.resolve()
    this.state = 1
    if (this._only.length) {
      for (const test of this) {
        if (this._only.indexOf(test) === -1) test.skip = true
      }
    }
    const tests = Array.from(this)
    this.emit('start', tests.length)
    if (this.options.sequential) {
      return new Promise((resolve, reject) => {
        const run = () => {
          const test = tests.shift()
          if (test) {
            if (test.skip) {
              this.emit('test-skip', test)
              run()
            } else {
              test.run()
                .then(result => {
                  try {
                    this.emitPass(test, result)
                    run()
                  } catch (err) {
                    this.state = 2
                    this.emit('end')
                    reject(err)
                  }
                })
                .catch(err => {
                  try {
                    this.emitFail(test, err)
                    run()
                  } catch (err) {
                    this.state = 2
                    this.emit('end')
                    reject(err)
                  }
                })
            }
          } else {
            this.state = 2
            this.emit('end')
            resolve()
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
    if (typeof process !== 'undefined') process.exitCode = 1
    this.emit('test-fail', test, err)
    this.emit('test-end', test, err)
  }

  clear () {
    this.tests = []
    this._only = []
  }
}

export default TestRunner
