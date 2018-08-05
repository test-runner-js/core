import TestRunner from '../lib/test-runner.mjs'
import a from 'assert'

{
  const runner = new TestRunner('runner.run: one test')
  runner.test('simple', function () {
    return true
  })
  runner.run()
    .then(results => {
      a.strictEqual(results[0], true)
    })
    .catch(err => {
      console.log(err)
      a.fail('should not reach here')
    })
}

{
  const runner = new TestRunner('runner.run: two tests')
  runner.test('simple', function () {
    return true
  })
  runner.test('simple 2', function () {
    return 1
  })
  runner.run()
    .then(results => {
      a.strictEqual(results[0], true)
      a.strictEqual(results[1], 1)
    })
    .catch(err => {
      console.log(err)
      a.fail('should not reach here')
    })
}
