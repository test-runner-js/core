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
  const thought = 'Nothing failing here.'
})
```

Failing test, sync.

```js
runner.test('this will fail', function () {
  throw new Error("Definitely something wrong here.")
})
```

To run the tests, simple execute the script:

```
$ node test.js
```

... or to test multiple files, use the command line tool:

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
            * [.skip()](#module_test-runner--TestRunner+skip)
            * [.only(name, testFunction)](#module_test-runner--TestRunner+only) ↩︎
            * [.runTest(name, testFunction)](#module_test-runner--TestRunner+runTest) ⇒ <code>\*</code>
        * _static_
            * [.run(globs)](#module_test-runner--TestRunner.run) ⇒ <code>Array</code>

<a name="exp_module_test-runner--TestRunner"></a>

### TestRunner ⇐ <code>EventEmitter</code> ⏏
Register tests and run them sequentially or in parallel. The testing can be set to begin manually or automatically.

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
Begin testing. You'll only need to use this method when `manualStart` is `true`.

**Kind**: instance method of <code>[TestRunner](#exp_module_test-runner--TestRunner)</code>  
**Fulfil**: <code>Array</code> - Resolves with an array containing the return value of each test.  
<a name="module_test-runner--TestRunner+test"></a>

#### testRunner.test(name, testFunction) ↩︎
Register a test.

**Kind**: instance method of <code>[TestRunner](#exp_module_test-runner--TestRunner)</code>  
**Chainable**  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| testFunction | <code>function</code> | 

<a name="module_test-runner--TestRunner+skip"></a>

#### testRunner.skip()
No-op. Use this method when you want a test to be skipped.

**Kind**: instance method of <code>[TestRunner](#exp_module_test-runner--TestRunner)</code>  
<a name="module_test-runner--TestRunner+only"></a>

#### testRunner.only(name, testFunction) ↩︎
Only run this test.

**Kind**: instance method of <code>[TestRunner](#exp_module_test-runner--TestRunner)</code>  
**Chainable**  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| testFunction | <code>function</code> | 

<a name="module_test-runner--TestRunner+runTest"></a>

#### testRunner.runTest(name, testFunction) ⇒ <code>\*</code>
Run test, returning the result which may be a Promise.

**Kind**: instance method of <code>[TestRunner](#exp_module_test-runner--TestRunner)</code>  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| testFunction | <code>function</code> | 

<a name="module_test-runner--TestRunner.run"></a>

#### TestRunner.run(globs) ⇒ <code>Array</code>
Run one or more test files. The output will be an array containing the export value from each module.

**Kind**: static method of <code>[TestRunner](#exp_module_test-runner--TestRunner)</code>  

| Param | Type |
| --- | --- |
| globs | <code>Array.&lt;string&gt;</code> | 


* * *

&copy; 2016 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
