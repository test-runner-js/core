import Test from './test.mjs'

class TestRunner {
  constructor () {
    this.tests = []
  }

  test (name, testFn) {
    this.tests.push(new Test(name, testFn))
  }

  run () {
    return this.tests.map(test => test.run())
  }
}

export default TestRunner
