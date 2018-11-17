export default function testSuite (assert, TestRunner, view) {
  const tests = []

  tests.push(function (assert) {
    const runner = new TestRunner({ name: 'runner.start: one test', view })
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
    const runner = new TestRunner({ name: 'runner.start: two tests', view })
    runner.test('simple', function () {
      assert(this.index === 1)
      return true
    })
    runner.test('simple 2', function () {
      assert(this.index === 2)
      return 1
    })
    return runner.start()
      .then(results => {
        assert(results[0] === true)
        assert(results[1] === 1)
      })
  })

  return Promise.all(tests.map(t => t(assert)))
}
