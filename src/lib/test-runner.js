'use strict'
const ansi = require('ansi-escape-sequences')
const EventEmitter = require('events').EventEmitter
const from = require('core-js/library/fn/array/from')
const includes = require('core-js/library/fn/array/includes')
const Map = require('core-js/library/fn/map')
const Promise_ = typeof Promise === 'undefined' ? require('core-js/library/fn/promise') : Promise

/**
 * @module test-runner
 */

const only = []

/**
 * @extends {EventEmitter}
 * @alias module:test-runner
 */
class TestRunner extends EventEmitter {

  /**
   * @param [options] {object}
   * @param [options.log] {function} - Specify a custom log function. Defaults to `console.log`.
   * @param [options.manualStart] {boolean} - If `true`, you must call `runner.start()` manually.
   * @param [options.sequential] {boolean} - Run each test sequentially.
   */
  constructor (options) {
    super()
    options = options || {}
    this.sequential = options.sequential
    this.tests = new Map()
    this.passed = []
    this.noop = []
    this.failed = []
    this.suiteFailed = false
    this.index = 1
    this.log = options.log || console.log

    this._autoStarted = false
    if (!options.manualStart) {
      process.on('beforeExit', () => {
        if (!this._autoStarted) {
          this.start()
          this._autoStarted = true
        }
      })
    }
  }

  /**
   * @returns {Promise}
   * @fulfil {Array} - Resolves with an array containing the return value of each test.
   */
  start () {
    this.emit('start')
    if (this.sequential) {
      const tests = from(this.tests)
      return new Promise((resolve, reject) => {
        const run = () => {
          const testItem = tests.shift()
          const [ name, testFunction ] = testItem
          let result = this.runTest(name, testFunction)
          if (!(result && result.then)) result = Promise.resolve(result)
          result.then(() => {
            if (tests.length) {
              run()
            } else {
              resolve()
            }
          })
        }
        run()
      })
    } else {
      const testResults = from(this.tests).map(testItem => {
        const [ name, testFunction ] = testItem
        return this.runTest(name, testFunction)
      })
      return Promise_
        .all(testResults)
        .then(results => {
          if (this.suiteFailed) process.exitCode = 1
          this.emit('end')
          return results
        })
        .catch(err => {
          // exceptions already handled
        })
    }
  }

  /**
   * @param {string}
   * @param {function}
   * @chainable
   */
  test (name, testFunction) {
    if (this.tests.has(name)) {
      console.error('Duplicate test name: ' + name)
      process.exit(1)
    }
    this.tests.set(name, testFunction)
    return this
  }

  /**
   * no-op
   */
  skip () {}

  /**
   * Only run this test.
   */
  only (name, testFunction) {
    this.test(name, testFunction)
    only.push(name)
  }

  /**
   * Run test, returning the result which may be a Promise.
   * @param {string}
   * @param {function}
   * @returns {*}
   */
  runTest (name, testFunction) {
    if (only.length && !includes(only, name)) {
      return
    } else if (!testFunction) {
      this.printNoOp(name)
      return
    }

    let result
    try {
      result = testFunction.call({
        name: name,
        index: this.index++
      })
      if (result && result.then) {
        result
          .then(output => this.printOk(name, output))
          .catch(err => this.printFail(name, err))
      } else {
        this.printOk(name, result)
      }
    } catch (err) {
      result = '__failed'
      this.printFail(name, err)
    }
    return result
  }

  printOk (name, msg) {
    this.log(`${ansi.format(name, 'green')}: ${msg || 'ok'}`)
    this.tests.delete(name)
    this.passed.push(name)
  }

  printNoOp (name, msg) {
    this.log(`${ansi.format(name, 'magenta')}: ${msg || '--'}`)
    this.tests.delete(name)
    this.noop.push(name)
  }

  printFail (name, err) {
    this.suiteFailed = true
    let msg
    if (err) {
      msg = err.stack || err
    } else {
      msg = 'failed'
    }
    this.log(`${ansi.format(name, 'red')}: ${msg}`)
    this.tests.delete(name)
    this.failed.push(name)
  }

  /**
   * Run one or more test files.
   */
  static run (globs) {
    const arrayify = require('array-back')
    globs = arrayify(globs)
    const FileSet = require('file-set')
    const path = require('path')
    const flatten = require('reduce-flatten')
    return globs
      .map(glob => {
        const fileSet = new FileSet(glob)
        return fileSet.files.map(file => require(path.resolve(process.cwd(), file)))
      })
      .reduce(flatten, [])
  }
}

/* variance for node 0.10 */
class OldNodeTestRunner extends TestRunner {
  test (name, testFunction) {
    this.runTest(name, testFunction)
    if (this.suiteFailed) {
      process.nextTick(() => process.exit(1))
    }
  }
}

function beforeExitEventExists () {
  const version = process.version.replace('v', '').split('.').map(Number)
  return version[0] > 0 || (version[0] === 0 && version[1] >= 11 && version[2] >= 12)
}

if (beforeExitEventExists()) {
  module.exports = TestRunner
} else {
  module.exports = OldNodeTestRunner
}
