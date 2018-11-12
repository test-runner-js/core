import testSuite from '../test.mjs'
import testRunnerSuite from '../test-runner.mjs'
import testRunnerLoad from '../test-runner-load.mjs'
import a from 'assert'

testSuite(a.ok)
  .then(function () {
    return testRunnerSuite(a.ok)
  })
  .then(function () {
    console.log('Done.')
  })
  .catch(function (err) {
    process.exitCode = 1
    console.error(err)
  })
