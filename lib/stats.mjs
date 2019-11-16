/**
 * Stats object.
 */
class Stats {
  constructor () {
    /**
     * Total tests run.
     */
    this.total = 0
    /**
     * Runner start time.
     */
    this.start = 0
    /**
     * Runner end time.
     */
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
