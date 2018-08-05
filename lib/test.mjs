class Test {
  constructor (name, testFn, options) {
    this.name = name
    this.testFn = testFn
    this.index = 1
    this.options = Object.assign({ timeout: 1000 }, options)
  }
  run () {
    const testFnResult = new Promise((resolve, reject) => {
      try {
        const result = this.testFn.call({
          name: this.name,
          index: this.index++
        })
        if (result && result.then) {
          result.then(resolve).catch(reject)
        } else {
          resolve(result)
        }
      } catch (err) {
        reject(err)
      }
    })

    const timeoutResult = new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => {
          const err = new Error(`Timeout exceeded [${this.options.timeout}ms]`)
          reject(err)
        },
        this.options.timeout
      )
      timeout.unref()
    })

    return Promise.race([ testFnResult, timeoutResult ])
  }
}

export default Test
