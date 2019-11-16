class Stats {
  constructor () {
    this.total = 0
    this.start = 0
    this.end = 0
    this.pass = 0
    this.fail = 0
    this.skip = 0
    this.ignore = 0
  }

  timeElapsed () {
    return this.end - this.start
  }
}

export default Stats
