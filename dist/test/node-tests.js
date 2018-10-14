'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var a = _interopDefault(require('assert'));

class Test {
  constructor (name, testFn, options) {
    this.name = name;
    this.testFn = testFn;
    this.index = 1;
    this.options = Object.assign({ timeout: 10000 }, options);
  }
  
  run () {
    const testFnResult = new Promise((resolve, reject) => {
      try {
        const result = this.testFn.call({
          name: this.name,
          index: this.index++
        });
        if (result && result.then) {
          result.then(resolve).catch(reject);
        } else {
          resolve(result);
        }
      } catch (err) {
        reject(err);
      }
    });

    const timeoutResult = new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => {
          const err = new Error(`Timeout exceeded [${this.options.timeout}ms]`);
          reject(err);
        },
        this.options.timeout
      );
      if (timeout.unref) timeout.unref();
    });

    return Promise.race([ testFnResult, timeoutResult ])
  }
}

function testSuite (assert) {
  {
    const test = new Test('passing sync test', function () {
      return true
    });
    test.run()
      .then(result => {
        assert(result === true);
      })
      .catch(err => {
        console.log(err);
        assert(false, 'should not reach here');
      });
  }

  {
    const test = new Test('failing sync test', function () {
      throw new Error('failed')
    });
    test.run()
      .then(() => {
        assert(false, "shouldn't reach here");
      })
      .catch(err => {
        assert(/failed/.test(err.message));
      });
  }

  {
    const test = new Test('passing async test', function () {
      return Promise.resolve(true)
    });
    test.run().then(result => {
      assert(result === true);
    });
  }

  {
    const test = new Test('failing async test: rejected', function () {
      return Promise.reject(new Error('failed'))
    });
    test.run()
      .then(() => {
        assert(false, "shouldn't reach here");
      })
      .catch(err => {
        assert(/failed/.test(err.message));
      });
  }

  {
    const test = new Test(
      'failing async test: timeout',
      function () {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, 300);
        })
      },
      { timeout: 150 }
    );
    test.run()
      .then(() => assert(false, 'should not reach here'))
      .catch(err => {
        assert(/Timeout exceeded/.test(err.message));
      });
  }

  {
    const test = new Test(
      'passing async test: timeout',
      function () {
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve('ok'), 300);
        })
      },
      { timeout: 350 }
    );
    test.run()
      .then(result => {
        assert(result === 'ok');
      })
      .catch(err => {
        console.log(err);
        assert(false, 'should not reach here');
      });
  }
}

class TestRunner {
  constructor () {
    this.tests = [];
  }

  test (name, testFn, options) {
    this.tests.push(new Test(name, testFn, options));
  }

  run () {
    return Promise.all(this.tests.map(test => test.run()))
  }
}

function testSuite$1 (assert) {
  {
    const runner = new TestRunner('runner.run: one test');
    runner.test('simple', function () {
      return true
    });
    runner.run()
      .then(results => {
        assert(results[0] === true);
      })
      .catch(err => {
        console.log(err);
        assert(false, 'should not reach here');
      });
  }

  {
    const runner = new TestRunner('runner.run: two tests');
    runner.test('simple', function () {
      return true
    });
    runner.test('simple 2', function () {
      return 1
    });
    runner.run()
      .then(results => {
        assert(results[0] === true);
        assert(results[1] === 1);
      })
      .catch(err => {
        console.log(err);
        assert(false, 'should not reach here');
      });
  }
}

testSuite(a.ok);
testSuite$1(a.ok);

console.log('Done.');
