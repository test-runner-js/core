import testSuite from '../test.mjs'
import testRunnerSuite from '../test-runner.mjs'

testSuite(console.assert)
testRunnerSuite(console.assert)

console.log('Done.')
