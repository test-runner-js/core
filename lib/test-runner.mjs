import Test from './test.mjs'
import { EventEmitter } from 'events'


class TestRunner extends EventEmitter {
  constructor () {
    super()
    this.tests = []
  }

  test (name, testFn, options) {
    this.tests.push(new Test(name, testFn, options))
  }

  run () {
    return Promise.all(this.tests.map(test => test.run()))
  }

  attachView () {

  }
}

export default TestRunner
