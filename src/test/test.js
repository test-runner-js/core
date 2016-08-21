'use strict'
const TestRunner = require('../../')
const a = require('core-assert')
const path = require('path')

/* node 0.10 */
if (TestRunner.name === 'OldNodeTestRunner') {
  const runners = TestRunner.run(__dirname + '/fixture/*.js')
  a.strictEqual(runners[0].passed.length, 1)
  a.strictEqual(runners[0].failed.length, 1)
  a.strictEqual(runners[1].passed.length, 1)
  a.strictEqual(runners[1].failed.length, 1)
  a.strictEqual(runners.length, 2)
  process.exit(0)

/* node >= 0.11.12 */
} else {
  const runners = TestRunner.run(__dirname + '/fixture/*.js')
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
      process.exitCode = 0
    })
    .catch(err => {
      process.exitCode = 1
      console.error(err.stack)
    })
}
