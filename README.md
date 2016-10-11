[![view on npm](http://img.shields.io/npm/v/test-runner.svg)](https://www.npmjs.org/package/test-runner)
[![npm module downloads](http://img.shields.io/npm/dt/test-runner.svg)](https://www.npmjs.org/package/test-runner)
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
  console.log('Wow, nice day outside.')
})
```

Failing test, sync.

```js
runner.test('this will fail', function () {
  throw new Error("Damn, it's bucketing it down.")
})
```

<a name="module_test-runner"></a>

## test-runner

* [test-runner](#module_test-runner)
    * [TestRunner](#exp_module_test-runner--TestRunner) ⇐ <code>EventEmitter</code> ⏏
        * [new TestRunner([options])](#new_module_test-runner--TestRunner_new)
        * _instance_
            * [.start()](#module_test-runner--TestRunner+start) ⇒ <code>Promise</code>
            * [.test(name, testFunction)](#module_test-runner--TestRunner+test) ↩︎
            * [.skip()](#module_test-runner--TestRunner+skip)
            * [.only()](#module_test-runner--TestRunner+only)
            * [.runTest(name, testFunction)](#module_test-runner--TestRunner+runTest) ⇒ <code>\*</code>
        * _static_
            * [.run()](#module_test-runner--TestRunner.run)

<a name="exp_module_test-runner--TestRunner"></a>

### TestRunner ⇐ <code>EventEmitter</code> ⏏
**Kind**: Exported class  
**Extends:** <code>EventEmitter</code>  
<a name="new_module_test-runner--TestRunner_new"></a>

#### new TestRunner([options])

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> |  |
| [options.log] | <code>function</code> | Specify a custom log function. Defaults to `console.log`. |
| [options.manualStart] | <code>boolean</code> | If `true`, you must call `runner.start()` manually. |
| [options.sequential] | <code>boolean</code> | Run each test sequentially. |

<a name="module_test-runner--TestRunner+start"></a>

#### testRunner.start() ⇒ <code>Promise</code>
**Kind**: instance method of <code>[TestRunner](#exp_module_test-runner--TestRunner)</code>  
**Fulfil**: <code>Array</code> - Resolves with an array containing the return value of each test.  
<a name="module_test-runner--TestRunner+test"></a>

#### testRunner.test(name, testFunction) ↩︎
**Kind**: instance method of <code>[TestRunner](#exp_module_test-runner--TestRunner)</code>  
**Chainable**  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| testFunction | <code>function</code> | 

<a name="module_test-runner--TestRunner+skip"></a>

#### testRunner.skip()
no-op

**Kind**: instance method of <code>[TestRunner](#exp_module_test-runner--TestRunner)</code>  
<a name="module_test-runner--TestRunner+only"></a>

#### testRunner.only()
Only run this test.

**Kind**: instance method of <code>[TestRunner](#exp_module_test-runner--TestRunner)</code>  
<a name="module_test-runner--TestRunner+runTest"></a>

#### testRunner.runTest(name, testFunction) ⇒ <code>\*</code>
Run test, returning the result which may be a Promise.

**Kind**: instance method of <code>[TestRunner](#exp_module_test-runner--TestRunner)</code>  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| testFunction | <code>function</code> | 

<a name="module_test-runner--TestRunner.run"></a>

#### TestRunner.run()
Run one or more test files.

**Kind**: static method of <code>[TestRunner](#exp_module_test-runner--TestRunner)</code>  

* * *

&copy; 2016 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
