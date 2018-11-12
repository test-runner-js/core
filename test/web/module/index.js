import testSuite from '../../test.mjs'
import testRunnerSuite from '../../test-runner.mjs'

testSuite(console.assert)
  .then(function () {
    return testRunnerSuite(console.assert)
  })
  .catch(function (err) {
    console.error(err)
  })
