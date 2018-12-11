import TestRunner from '../index.mjs'
import a from 'assert'

const tests = []

tests.push(function () {
  const runner = new TestRunner({ name: 'runner.start: one test' })
  runner.test('simple', function () {
    a.ok(this.name === 'simple')
    return true
  })
  return runner.start()
    .then(results => {
      console.log('result', results)
      a.ok(results[0] === true)
    })
})

tests.push(function () {
  const runner = new TestRunner({ name: 'runner.start: two tests' })
  runner.test('simple', function () {
    a.ok(this.index === 1)
    return true
  })
  runner.test('simple 2', function () {
    a.ok(this.index === 2)
    return 1
  })
  return runner.start()
    .then(results => {
      a.ok(results[0] === true)
      a.ok(results[1] === 1)
    })
})

Promise.all(tests.map(test => test()))
  .then(function () {
    console.log('Done.')
  })
  .catch(function (err) {
    process.exitCode = 1
    console.error(err)
  })
