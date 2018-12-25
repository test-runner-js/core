class ViewBase {
  attach (runner) {
    if (this.attachedTo !== runner) {
      const view = this
      this._callback = {
        start: this.start.bind(this),
        end: this.end.bind(this),
        testPass: function () {
          const test = this
          view.testPass(test, 'something')
        },
        testFail: this.testFail.bind(this),
        testSkip: function () {
          const test = this
          view.testSkip(test)
        }
      }
      runner.on('start', this._callback.start)
      runner.on('end', this._callback.end)
      runner.tom.on('pass', this._callback.testPass)
      runner.tom.on('fail', this._callback.testFail)
      runner.tom.on('skip', this._callback.testSkip)
      this.attachedTo = runner
    }
  }

  detach () {
    if (this.attachedTo && this._callback) {
      this.attachedTo.removeEventListener('start', this._callback.start)
      this.attachedTo.removeEventListener('end', this._callback.end)
      this.attachedTo.tom.removeEventListener('pass', this._callback.testPass)
      this.attachedTo.tom.removeEventListener('fail', this._callback.testFail)
      this.attachedTo.tom.removeEventListener('skip', this._callback.testSkip)
      this.attachedTo = null
    }
  }

  log () {
    console.log(...arguments)
  }
  start () {
    throw new Error('not implemented')
  }
  end () {
    throw new Error('not implemented')
  }
  testPass (test, result) {
    throw new Error('not implemented')
  }
  testFail (test, err) {
    throw new Error('not implemented')
  }
  testSkip (test) {
    throw new Error('not implemented')
  }
}

export default ViewBase
