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
  const thought = 'Nothing failing here.'
})
```

Passing test, async.

```js
runner.test('this will also pass', function () {
  return Promise.resolve('Nothing failing here.')
})
```

Failing test, sync.

```js
runner.test('this will fail', function () {
  throw new Error('Definitely something wrong here.')
})
```

Failing test, async.

```js
runner.test('this will also fail', function () {
  return Promise.reject('Definitely something wrong here.')
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
    * [TestRunner](#exp_module_test-runner--TestRunner) ⇐ <code>EventEmitter</code> ⏏
        * [new TestRunner([options])](#new_module_test-runner--TestRunner_new)
        * _instance_
            * [.start()](#module_test-runner--TestRunner+start) ⇒ <code>Promise</code>
            * [.test(name, testFunction)](#module_test-runner--TestRunner+test) ↩︎
            * [.skip()](#module_test-runner--TestRunner+skip) ↩︎
            * [.only(name, testFunction)](#module_test-runner--TestRunner+only) ↩︎
        * _static_
            * [.run(globs)](#module_test-runner--TestRunner.run) ⇒ <code>Array</code>

<a name="exp_module_test-runner--TestRunner"></a>

### TestRunner ⇐ <code>EventEmitter</code> ⏏
Register tests and run them sequentially or in parallel. By default, testing begins automatically but can be set to start manually.

**Kind**: Exported class  
**Extends**: <code>EventEmitter</code>  
<a name="new_module_test-runner--TestRunner_new"></a>

#### new TestRunner([options])

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> |  |
| [options.log] | <code>function</code> | Specify a custom log function. Defaults to `console.log`. |
| [options.manualStart] | <code>boolean</code> | If `true`, you must call `runner.start()` manually. |
| [options.sequential] | <code>boolean</code> | Run async tests sequentially. |

<a name="module_test-runner--TestRunner+start"></a>

#### testRunner.start() ⇒ <code>Promise</code>
Begin testing. You'll only need to use this method when `manualStart` is `true`.

**Kind**: instance method of [<code>TestRunner</code>](#exp_module_test-runner--TestRunner)  
**Fulfil**: <code>Array</code> - Resolves with an array containing the return value of each test.  
<a name="module_test-runner--TestRunner+test"></a>

#### testRunner.test(name, testFunction) ↩︎
Register a test.

**Kind**: instance method of [<code>TestRunner</code>](#exp_module_test-runner--TestRunner)  
**Chainable**  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Each name supplied must be unique to the runner instance. |
| testFunction | <code>function</code> | The test function. If it throws or rejects, the test will fail. |

<a name="module_test-runner--TestRunner+skip"></a>

#### testRunner.skip() ↩︎
No-op. Use this method when you want a test to be skipped.

**Kind**: instance method of [<code>TestRunner</code>](#exp_module_test-runner--TestRunner)  
**Chainable**  
<a name="module_test-runner--TestRunner+only"></a>

#### testRunner.only(name, testFunction) ↩︎
Only run this and other tests registered with `only`.

**Kind**: instance method of [<code>TestRunner</code>](#exp_module_test-runner--TestRunner)  
**Chainable**  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| testFunction | <code>function</code> | 

<a name="module_test-runner--TestRunner.run"></a>

#### TestRunner.run(globs) ⇒ <code>Array</code>
Run one or more test files. The output will be an array containing the export value from each module.

**Kind**: static method of [<code>TestRunner</code>](#exp_module_test-runner--TestRunner)  

| Param | Type | Description |
| --- | --- | --- |
| globs | <code>Array.&lt;string&gt;</code> | One or more file paths or glob expressions. |


* * *

&copy; 2016-17 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
