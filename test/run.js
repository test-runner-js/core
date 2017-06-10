'use strict'
const TestRunner = require('../')
const a = require('assert')
const path = require('path')

const runners = TestRunner.run(path.resolve(__dirname, 'fixture/*.js'))
const done = []

for (const runner of runners) {
  runner.on('start', function () {
    done.push('start')
  })

  runner.on('end', function () {
    a.strictEqual(this.passed.length, 1)
    a.strictEqual(this.failed.length, 1)
    done.push('end')
  })
}

Promise
  .all(runners.map(runner => {
    return runner.start()
  }))
  .then(results => {
    a.strictEqual(process.exitCode, 1)
    a.deepEqual(done, [ 'start', 'start', 'end', 'end' ])
    console.log('TestRunner.run() ✔︎')
    process.exitCode = 0
  })
  .catch(err => {
    process.exitCode = 1
    console.error(err.stack)
  })
