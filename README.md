[![view on npm](https://img.shields.io/npm/v/test-runner.svg)](https://www.npmjs.org/package/test-runner)
[![npm module downloads](https://img.shields.io/npm/dt/test-runner.svg)](https://www.npmjs.org/package/test-runner)
[![Build Status](https://travis-ci.org/75lb/test-runner.svg?branch=master)](https://travis-ci.org/75lb/test-runner)
[![Dependency Status](https://david-dm.org/75lb/test-runner.svg)](https://david-dm.org/75lb/test-runner)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

# test-runner

A minimal test runner built around a single, core principle: if a test function completes successfully (or fulfils), it passes. If it throws (or rejects) it fails. It has no opinion how you write tests, or which (if any) assertion library you use.

```js
const TestRunner = require('test-runner')
const runner = new TestRunner()
```

## Synopsis

Passing test, sync.

```js
runner.test('this will pass', function () {
  const result = 'Pass'
})
```

Passing test, async.

```js
runner.test('this will also pass', function () {
  return Promise.resolve('Pass')
})
```

Failing test, sync.

```js
runner.test('this will fail', function () {
  throw new Error('Fail')
})
```

Failing test, async.

```js
runner.test('this will also fail', function () {
  return Promise.reject('Fail')
})
```

To run the tests, execute the script:

```
$ node test.js
```

... or use the command-line tool to test multiple files:

```
$ test-runner test/*.js
```

<a name="module_test-runner"></a>

## test-runner

* [test-runner](#module_test-runner)
    * [TestRunner](#exp_module_test-runner--TestRunner) ⏏
        * [.start()](#module_test-runner--TestRunner+start) ⇒ <code>Promise</code>

<a name="exp_module_test-runner--TestRunner"></a>

### TestRunner ⏏
**Kind**: Exported class  
**Emits**: <code>event:start</code>, <code>event:end</code>, <code>event:test-start</code>, <code>event:test-end</code>, <code>event:test-pass</code>, <code>event:test-fail</code>  
<a name="module_test-runner--TestRunner+start"></a>

#### testRunner.start() ⇒ <code>Promise</code>
Run all tests in parallel

**Kind**: instance method of [<code>TestRunner</code>](#exp_module_test-runner--TestRunner)  

* * *

&copy; 2016-18 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
