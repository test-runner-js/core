'use strict';

class ViewBase {
  constructor () {
    this._callback = {
      start: this.start.bind(this),
      end: this.end.bind(this),
      testPass: this.testPass.bind(this),
      testFail: this.testFail.bind(this),
      testSkip: this.testSkip.bind(this)
    };
  }

  attach (runner) {
    if (this.attachedTo !== runner) {
      runner.on('start', this._callback.start);
      runner.on('end', this._callback.end);
      runner.on('test-pass', this._callback.testPass);
      runner.on('test-fail', this._callback.testFail);
      runner.on('test-skip', this._callback.testSkip);
      this.attachedTo = runner;
    }
  }

  detach () {
    if (this.attachedTo) {
      this.attachedTo.removeEventListener('start', this._callback.start);
      this.attachedTo.removeEventListener('end', this._callback.end);
      this.attachedTo.removeEventListener('test-pass', this._callback.testPass);
      this.attachedTo.removeEventListener('test-fail', this._callback.testFail);
      this.attachedTo.removeEventListener('test-skip', this._callback.testSkip);
      this.attachedTo = null;
    }
  }

  start (count) {
    throw new Error('not implemented')
  }
  end (count) {
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

module.exports = ViewBase;
