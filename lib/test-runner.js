'use strict'
const ansi = require('ansi-escape-sequences')
const EventEmitter = require('events').EventEmitter

/**
 * @module test-runner
 */

const only = []

/**
 * Register tests and run them sequentially or in parallel. By default, testing begins automatically but can be set to start manually.
 * @extends {EventEmitter}
 * @alias module:test-runner
 */
class TestRunner extends EventEmitter {

  /**
   * @param [options] {object}
   * @param [options.log] {function} - Specify a custom log function. Defaults to `console.log`.
   * @param [options.manualStart] {boolean} - If `true`, you must call `runner.start()` manually.
   * @param [options.sequential] {boolean} - Run async tests sequentially.
   */
  constructor (options) {
    super()
    options = options || {}
    this.sequential = options.sequential
    this.manualStart = options.manualStart
    this.tests = new Map()
    this.passed = []
    this.noop = []
    this.failed = []
    this.suiteFailed = false
    this.index = 1
    this.log = options.log || console.log

    this._autoStarted = false
    if (!options.manualStart) {
      process.setMaxListeners(Infinity)
      process.on('beforeExit', () => {
        if (!this._autoStarted) {
          this.start()
          this._autoStarted = true
        }
      })
    }
  }

  /**
   * Begin testing. You'll only need to use this method when `manualStart` is `true`.
   * @returns {Promise}
   * @fulfil {Array} - Resolves with an array containing the return value of each test.
   */
  start () {
    this.emit('start')

    /* sequential */
    if (this.sequential) {
      const tests = Array.from(this.tests)
      return new Promise((resolve, reject) => {
        const run = () => {
          const testItem = tests.shift()
          const name = testItem[0]
          const testFunction = testItem[1]
          let result = this.runTest(name, testFunction)
          if (!(result && result.then)) result = Promise.resolve(result)
          result
            .then(() => {
              if (tests.length) {
                run()
              } else {
                if (this.suiteFailed) process.exitCode = 1
                resolve()
              }
            })
            .catch(err => {
              if (this.suiteFailed) process.exitCode = 1
              reject(err)
            })
        }
        run()
      })

    /* parallel */
    } else {
      const testResults = Array.from(this.tests).map(testItem => {
        const name = testItem[0]
        const testFunction = testItem[1]
        return this.runTest(name, testFunction)
      })
      const result = Promise
        .all(testResults)
        .then(results => {
          if (this.suiteFailed) process.exitCode = 1
          this.emit('end')
          return results
        })
        .catch(err => {
          if (this.suiteFailed) process.exitCode = 1
          this.emit('end')
          throw err
        })

      if (this.manualStart) {
        return result
      } else {
        return result.catch(() => {
          // exceptions won't be handled, avoid warning.
        })
      }
    }
  }

  /**
   * Register a test.
   * @param {string} - Each name supplied must be unique to the runner instance.
   * @param {function} - The test function. If it throws or rejects, the test will fail.
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
   * No-op. Use this method when you want a test to be skipped.
   * @chainable
   */
  skip () {
    return this
  }

  /**
   * Only run this and other tests registered with `only`.
   * @param {string}
   * @param {function}
   * @chainable
   */
  only (name, testFunction) {
    this.test(name, testFunction)
    only.push(name)
    return this
  }

  /**
   * Run test, returning the result which may be a Promise.
   * @param {string}
   * @param {function}
   * @returns {*}
   * @ignore
   */
  runTest (name, testFunction) {
    /* runner.only */
    if (only.length && !only.includes(name)) {
      return

    /* placeholder test */
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
   * Run one or more test files. The output will be an array containing the export value from each module.
   * @param {string[]} - One or more file paths or glob expressions.
   * @returns {Array}
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

module.exports = TestRunner
