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
  tests.set(name, testFunction)
}

test.skip = function () {}
test.only = function (name, testFunction) {
  test(name, testFunction)
  only.push(name)
}

process.on('beforeExit', function () {
  const t = require('typical')
  for (const [ name, test ] of tests) {
    if (only.length && !only.includes(name)) continue
    let result
    try {
      result = test()
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
  tests.clear()
  if (suiteFailed) process.exitCode = 1
})

function printOk (name, msg) {
  console.log(`${ansi.format(name, 'green')}: ${msg || 'ok'}`)
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
}

process.on('unhandledRejection', function (reason, p) {
  console.error('unhandledRejection', reason)
})
