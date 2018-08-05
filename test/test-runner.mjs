import TestRunner from '../lib/test-runner.mjs'

function testSuite (assert) {
  {
    const runner = new TestRunner('runner.run: one test')
    runner.test('simple', function () {
      return true
    })
    runner.run()
      .then(results => {
        assert(results[0] === true)
      })
      .catch(err => {
        console.log(err)
        assert(false, 'should not reach here')
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
        assert(results[0] === true)
        assert(results[1] === 1)
      })
      .catch(err => {
        console.log(err)
        assert(false, 'should not reach here')
      })
  }
}

export default testSuite
