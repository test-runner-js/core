import raceTimeout from '../node_modules/race-timeout-anywhere/index.mjs'

/**
 * Test function class.
 * @param {string} name
 * @param {function} testFn
 * @param {object} options
 * @param {number} options.timeout
 */
class Test {
  constructor (name, testFn, options) {
    this.name = name
    this.testFn = testFn
    this.id = 1
    this.options = Object.assign({ timeout: 10000 }, options)
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
          id: this.id
        }))
        if (result && result.then) {
          result.then(resolve).catch(reject)
        } else {
          resolve(result)
        }
      } catch (err) {
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
    this.id = context.id
  }
}

export default Test
