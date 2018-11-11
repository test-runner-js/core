import TestRunner from '../lib/test-runner.mjs'

const tests = []

tests.push(function (assert) {
  const runner = new TestRunner('runner.start: one test')
  runner.test('simple', function () {
    assert(this.name === 'simple')
    return true
  })
  return runner.start()
    .then(results => {
      assert(results[0] === true)
    })
})

tests.push(function (assert) {
  const runner = new TestRunner('runner.start: two tests')
  runner.test('simple', function () {
    assert(this.id === 1)
    return true
  })
  runner.test('simple 2', function () {
    assert(this.id === 2)
    return 1
  })
  return runner.start()
    .then(results => {
      assert(results[0] === true)
      assert(results[1] === 1)
    })
})

function testSuite (assert) {
  return Promise.all(tests.map(t => t(assert)))
}

export default testSuite
