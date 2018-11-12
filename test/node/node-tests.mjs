import testSuite from '../test.mjs'
import testRunnerSuite from '../test-runner.mjs'
import testRunnerLoad from '../test-runner-load.mjs'
import a from 'assert'
import TestRunner from '../../lib/test-runner.mjs'

testSuite(a.ok)
  .then(function () {
    return testRunnerSuite(a.ok, TestRunner)
  })
  .then(function () {
    console.log('Done.')
  })
  .catch(function (err) {
    process.exitCode = 1
    console.error(err)
  })
