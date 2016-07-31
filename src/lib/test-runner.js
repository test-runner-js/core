'use strict'
const ansi = require('ansi-escape-sequences')

/**
 * @module test-runner
 */
module.exports = test

const tests = new Map()
const only = []
let suiteFailed = false

function test (name, testFunction) {
  if (beforeExitEventExists()) {
    tests.set(name, testFunction)
  } else {
    /* variance for node 0.10 */
    runTest(name, testFunction)
    if (suiteFailed) {
      process.nextTick(() => process.exit(1))
    }
  }
}

test.skip = function () {}
test.only = function (name, testFunction) {
  test(name, testFunction)
  only.push(name)
}

function runTest (name, testFunction) {
  const t = require('typical')
  if (only.length && !only.includes(name)) return
  let result
  try {
    result = testFunction()
    if (t.isPromise(result)) {
      result
        .then(output => printOk(name, output))
        .catch(err => printFail(name, err))
    } else {
      printOk(name, result)
    }
  } catch (err) {
    printFail(name, err)
  }
}

process.on('beforeExit', function () {
  for (const [ name, testFunction ] of tests) {
    runTest(name, testFunction)
  }
  if (suiteFailed) process.exitCode = 1
})

function printOk (name, msg) {
  console.log(`${ansi.format(name, 'green')}: ${msg || 'ok'}`)
  tests.delete(name)
}

function printFail (name, err) {
  suiteFailed = true
  let msg
  if (err) {
    msg = err.stack || err
  } else {
    msg = 'failed'
  }
  console.log(`${ansi.format(name, 'red')}: ${msg}`)
  tests.delete(name)
}

function beforeExitEventExists () {
  const version = process.version.replace('v', '').split('.')
  return version[0] > 0 || (version[0] === 0 && version[1] >= 11 && version[2] >= 12)
}
