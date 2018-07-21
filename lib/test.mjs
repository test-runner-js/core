class Test {
  constructor (name, testFn) {
    this.name = name
    this.testFn = testFn
    this.index = 1
  }
  run () {
    const result = this.testFn.call({
      name: this.name,
      index: this.index++
    })
    return result
  }
}

export default Test
