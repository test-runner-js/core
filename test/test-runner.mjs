import TestRunner from '../index.mjs'
import a from 'assert'

function halt (err) {
  console.log(err)
  process.exitCode = 1
}

{
  const runner = new TestRunner({ name: 'runner.start: one test' })
  runner.test('simple', function () {
    a.ok(this.name === 'simple')
    return true
  })
  runner.start()
    .then(results => {
      // console.log('result', results)
      a.ok(results[0] === true)
    })
    .catch(halt)
}

{
  const runner = new TestRunner({ name: 'runner.start: two tests' })
  runner.test('simple', function () {
    a.ok(this.index === 1)
    return true
  })
  runner.test('simple 2', function () {
    a.ok(this.index === 2)
    return 1
  })
  runner.start()
    .then(results => {
      a.ok(results[0] === true)
      a.ok(results[1] === 1)
    })
    .catch(halt)
}
