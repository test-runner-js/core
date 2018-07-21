import TestRunner from '../lib/test-runner.mjs'
import a from 'assert'

{
  const runner = new TestRunner()
  runner.test('simple', function () {
    return true
  })
  const results = runner.run()
  a.strictEqual(results[0], true)
}
