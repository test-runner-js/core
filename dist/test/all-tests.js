'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var a = _interopDefault(require('assert'));

class Test {
  constructor (name, testFn) {
    this.name = name;
    this.testFn = testFn;
    this.index = 1;
  }
  run () {
    const result = this.testFn.call({
      name: this.name,
      index: this.index++
    });
    return result
  }
}

{
  const test = new Test('simple', function () {
    return true
  });
  const result = test.run();
  a.strictEqual(result, true);
}

{
  const test = new Test('failing test', function () {
    throw new Error('failed')
  });
  a.throws(
    () => test.run(),
    /failed/
  );
}

class TestRunner {
  constructor () {
    this.tests = [];
  }

  test (name, testFn) {
    this.tests.push(new Test(name, testFn));
  }

  run () {
    return this.tests.map(test => test.run())
  }
}

{
  const runner = new TestRunner();
  runner.test('simple', function () {
    return true
  });
  const results = runner.run();
  a.strictEqual(results[0], true);
}

console.log('Done.');
