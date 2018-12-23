(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('fsm-base')) :
  typeof define === 'function' && define.amd ? define(['fsm-base'], factory) :
  (global = global || self, global.TestRunner = factory(global.StateMachine));
}(this, function (StateMachine) { 'use strict';

  StateMachine = StateMachine && StateMachine.hasOwnProperty('default') ? StateMachine['default'] : StateMachine;

  var consoleView = ViewBase => class ConsoleView extends ViewBase {
    start (count) {
      this.log(`Starting: ${count} tests`);
    }
    testPass (test, result) {
      this.log('✓', test.name, result || 'ok');
    }
    testSkip (test) {
      this.log('-', test.name);
    }
    testFail (test, err) {
      this.log('⨯', test.name);
      this.log(err);
    }
    end () {
      this.log(`End`);
    }
  };

  class ViewBase {
    attach (runner) {
      if (this.attachedTo !== runner) {
        this._callback = {
          start: this.start.bind(this),
          end: this.end.bind(this),
          testPass: this.testPass.bind(this),
          testFail: this.testFail.bind(this),
          testSkip: this.testSkip.bind(this)
        };
        runner.on('start', this._callback.start);
        runner.on('end', this._callback.end);
        runner.on('test-pass', this._callback.testPass);
        runner.on('test-fail', this._callback.testFail);
        runner.on('test-skip', this._callback.testSkip);
        this.attachedTo = runner;
      }
    }

    detach () {
      if (this.attachedTo && this._callback) {
        this.attachedTo.removeEventListener('start', this._callback.start);
        this.attachedTo.removeEventListener('end', this._callback.end);
        this.attachedTo.removeEventListener('test-pass', this._callback.testPass);
        this.attachedTo.removeEventListener('test-fail', this._callback.testFail);
        this.attachedTo.removeEventListener('test-skip', this._callback.testSkip);
        this.attachedTo = null;
      }
    }

    log () {
      console.log(...arguments);
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

  /**
   * @module test-runner
   */

  /**
   * @alias module:test-runner
   @ @param {object} [options]
   @ @param {function} [options.view]
   @ @param {object} [options.tom]
   * @emits start
   * @emits end
   */
  class TestRunner extends StateMachine {
    constructor (options) {
      options = options || {};
      super([
        { from: undefined, to: 'pending' },
        { from: 'pending', to: 'start' },
        { from: 'start', to: 'end' },
      ]);
      this.state = 'pending';
      this.tom = options.tom;
      const ViewClass = (options.view || consoleView)(ViewBase);
      this.view = new ViewClass();
    }

    set view (view) {
      if (view) {
        if (this._view) this._view.detach();
        this._view = view;
        this._view.attach(this);
      } else {
        if (this._view) this._view.detach();
        this._view = null;
      }
    }

    get view () {
      return this._view
    }

    start () {
      this.state = 'start';
      return this.runInParallel(this.tom).then(results => {
        this.state = 'end';
        return results
      })
    }

    runInParallel (tom) {
      return Promise.all(Array.from(tom).map(test => test.run()))
    }
  }

  return TestRunner;

}));
