import Emitter from './node_modules/@keystone/emitter/emitter.js'

const only = []

class TestRunner extends Emitter {
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

    this.on('pass', (name, msg) => {
      console.log('✅', name, msg)
    })
    this.on('fail', (name, err) => {
      console.error('🛑', name, err.stack, err)
    })
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
                // if (this.suiteFailed) process.exitCode = 1
                resolve()
              }
            })
            .catch(err => {
              // if (this.suiteFailed) process.exitCode = 1
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
          // if (this.suiteFailed) process.exitCode = 1
          this.emit('end')
          return results
        })
        .catch(err => {
          // if (this.suiteFailed) process.exitCode = 1
          this.emit('end')
          throw err
        })

      return result
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
      throw new Error('Duplicate test name: ' + name)
    } else if (!name) {
      throw new Error('Every test must have a name')
    }
    this.tests.set(name, testFunction)
    return this
  }

  /**
   * No-op. Use this method when you want a test to be skipped.
   * @chainable
   */
  skip (name) {
    this.printNoOp(name)
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
    // this.log(`${ansi.format(name, 'green')}: ${msg || 'ok'}`)
    this.emit('pass', name, msg || 'ok')
    this.tests.delete(name)
    this.passed.push(name)
  }

  printNoOp (name, msg) {
    // this.log(`${ansi.format(name, 'magenta')}: ${msg || '--'}`)
    this.emit('no-op', name, msg || '--')
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
    if (err.code === 'ERR_ASSERTION') {
      // this.log(ansi.format(name, 'red'))
      // this.log('EXPECTED')
      // this.log(require('util').inspect(err.expected, { depth: 6, colors: true }))
      // this.log('ACTUAL')
      // this.log(require('util').inspect(err.actual, { depth: 6, colors: true }))
      // this.log(err.stack)
      this.emit('fail', name, err)
    } else {
      // this.log(`${ansi.format(name, 'red')}: ${msg}`)
      this.emit('fail', name, err)
    }
    this.tests.delete(name)
    this.failed.push(name)
  }
}

export default TestRunner
