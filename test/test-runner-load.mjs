import TestRunner from '../lib/test-runner.mjs'

const tests = []

tests.push(function (assert) {
  const runner = new TestRunner('runner.start: load test')
  let i = 0
  while (i++ < 100000) {
    runner.test(`test ${i}`, function () {
      return i
    })
  }
  return runner.start()
    // .then(results => {
    //   assert(results[0] === true)
    //   assert(results[1] === 1)
    // })
})

function testSuite (assert) {
  return Promise.all(tests.map(t => t(assert)))
}

export default testSuite
