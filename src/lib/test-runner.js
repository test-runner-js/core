'use strict'
const ansi = require('ansi-escape-sequences')
const EventEmitter = require('events').EventEmitter
const t = require('typical')

/**
 * @module test-runner
 */

class TestRunner extends EventEmitter {
  constructor (options) {
    super()
    options = options || {}
    this.tests = new Map()
    this.passed = []
    this.failed = []
    this.only = []
    this.suiteFailed = false
    this.index = 1
    this.log = options.log || console.log

    if (!options.manualStart) {
      process.on('beforeExit', this.start.bind(this))
    }
  }

  start () {
    this.emit('start')
    return Promise
      .all(Array.from(this.tests).map(testItem => {
        const [ name, testFunction ] = testItem
        return this.runTest(name, testFunction)
      }))
      .then(results => {
        if (this.suiteFailed) process.exitCode = 1
        this.emit('end')
        return results
      })
  }

  test (name, testFunction) {
    if (this.tests.has(name)) {
      console.error('Duplicate test name: ' + name)
      process.exit(1)
    }
    this.tests.set(name, testFunction)
  }

  skip () {}
  only (name, testFunction) {
    test(name, testFunction)
    only.push(name)
  }

  runTest (name, testFunction) {
    if (this.only.length && !this.only.includes(name)) return
    let result
    try {
      result = testFunction.call({
        name: name,
        index: this.index++
      })
      if (t.isPromise(result)) {
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
