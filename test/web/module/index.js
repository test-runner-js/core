import testSuite from '../../lib/test.mjs'
import testRunnerSuite from '../../lib/test-runner.mjs'

testSuite(console.assert)
testRunnerSuite(console.assert)

console.log('Done.')
