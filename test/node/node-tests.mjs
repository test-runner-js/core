import testSuite from '../test.mjs'
import testRunnerSuite from '../test-runner.mjs'
import a from 'assert'

testSuite(a.ok)
testRunnerSuite(a.ok)

console.log('Done.')
