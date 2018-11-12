import testSuite from '../../test.mjs'
import testRunnerSuite from '../../test-runner.mjs'
import TestRunner from '../../../lib/test-runner-web.mjs'

testSuite(console.assert)
  .then(function () {
    return testRunnerSuite(console.assert, TestRunner)
  })
  .catch(function (err) {
    console.error(err)
  })
