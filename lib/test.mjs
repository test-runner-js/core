import raceTimeout from '../node_modules/race-timeout-anywhere/index.mjs'

/**
 * Test function class.
 * @param {string} name
 * @param {function} testFn
 * @param {object} [options]
 * @param {number} [options.timeout]
 */
class Test {
  constructor (name, testFn, options) {
    this.name = name
    this.testFn = testFn
    this.index = 1
    this.options = Object.assign({ timeout: 10000 }, options)
    this.state = 'pending'
  }

  /**
   * Execute the stored test function.
   * @returns {Promise}
   */
  run () {
    const testFnResult = new Promise((resolve, reject) => {
      try {
        const result = this.testFn.call(new TestContext({
          name: this.name,
          index: this.index
        }))
        this.state = 'passed'
        if (result && result.then) {
          result.then(resolve).catch(reject)
        } else {
          resolve(result)
        }
      } catch (err) {
        this.state = 'failed'
        reject(err)
      }
    })

    return Promise.race([ testFnResult, raceTimeout(this.options.timeout) ])
  }
}

/**
 * The test context, available as `this` within each test function.
 */
class TestContext {
  constructor (context) {
    this.name = context.name
    this.index = context.index
  }
}

export default Test
