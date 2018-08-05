import Test from './test.mjs'

class TestRunner {
  constructor () {
    this.tests = []
  }

  test (name, testFn, options) {
    this.tests.push(new Test(name, testFn, options))
  }

  run () {
    return Promise.all(this.tests.map(test => test.run()))
  }
}

export default TestRunner
