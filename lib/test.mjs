class Test {
  constructor (name, testFn) {
    this.name = name
    this.testFn = testFn
    this.index = 1
  }
  run () {
    return new Promise((resolve, reject) => {
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
  }
}

export default Test
