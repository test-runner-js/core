[![view on npm](https://img.shields.io/npm/v/test-runner-core.svg)](https://www.npmjs.org/package/test-runner-core)
[![npm module downloads](https://img.shields.io/npm/dt/test-runner-core.svg)](https://www.npmjs.org/package/test-runner-core)
[![Build Status](https://travis-ci.org/test-runner-js/core.svg?branch=master)](https://travis-ci.org/test-runner-js/core)
[![Dependency Status](https://badgen.net/david/dep/test-runner-js/core)](https://david-dm.org/test-runner-js/core)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

***This documentation is a work in progress.***

# test-runner-core

Isomophic test runner. Takes a test object model as input, runs it streaming progress info to the attached view or listener. Used by test-runner, esm-runner and web-runner.

## Synopsis

```js
import TestRunnerCore from '../index.mjs'
import Tom from 'test-object-model'

/* Define a test model */
const tom = new Tom()

tom.test('A successful test', function () {
  return 'This passed'
})

tom.test('A failing test', function () {
  throw new Error('This failed')
})

/* run the tests */
const runner = new TestRunnerCore(tom)

runner.on('state', (state, prevState) => {
  console.log(`Runner state change: ${prevState} -> ${state}`)
})
runner.on('test-pass', test => {
  console.log(`Test passed: ${test.name}`)
})
runner.on('test-fail', test => {
  console.log(`Test failed: ${test.name}`)
})
runner.start().then(() => {
  console.log(`Test run complete. State: ${runner.state}, passed: ${runner.stats.pass}, failed: ${runner.stats.fail}`)
})
```

Output.

```
$ node --experimental-modules synopsis.mjs
Runner state change: pending -> in-progress
Test passed: A successful test
Test failed: A failing test
Runner state change: in-progress -> fail
Test run complete. State: fail, passed: 1, failed: 1
```

## See also

* [API docs](https://github.com/test-runner-js/core/blob/master/docs/API.md)

* * *

&copy; 2016-19 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
