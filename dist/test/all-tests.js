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
      timeout.unref();
    });

    return Promise.race([ testFnResult, timeoutResult ])
  }
}

{
  const test = new Test('passing sync test', function () {
    return true
  });
  test.run()
    .then(result => {
      a.strictEqual(result, true);
    })
    .catch(err => {
      console.log(err);
      a.fail('should not reach here');
    });
}

{
  const test = new Test('failing sync test', function () {
    throw new Error('failed')
  });
  test.run()
    .then(() => {
      a.fail("shouldn't reach here");
    })
    .catch(err => {
      a.ok(/failed/.test(err.message));
    });
}

{
  const test = new Test('passing async test', function () {
    return Promise.resolve(true)
  });
  test.run().then(result => {
    a.strictEqual(result, true);
  });
}

{
  const test = new Test('failing async test: rejected', function () {
    return Promise.reject(new Error('failed'))
  });
  test.run()
    .then(() => {
      a.fail("shouldn't reach here");
    })
    .catch(err => {
      a.ok(/failed/.test(err.message));
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
    .then(() => a.fail('should not reach here'))
    .catch(err => {
      a.ok(/Timeout exceeded/.test(err.message));
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
      a.strictEqual(result, 'ok');
    })
    .catch(err => {
      console.log(err);
      a.fail('should not reach here');
    });
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

{
  const runner = new TestRunner('runner.run: one test');
  runner.test('simple', function () {
    return true
  });
  runner.run()
    .then(results => {
      a.strictEqual(results[0], true);
    })
    .catch(err => {
      console.log(err);
      a.fail('should not reach here');
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
      a.strictEqual(results[0], true);
      a.strictEqual(results[1], 1);
    })
    .catch(err => {
      console.log(err);
      a.fail('should not reach here');
    });
}

console.log('Done.');
