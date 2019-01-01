import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'

{ /* runner states: fail */
  let counts = []
  const tom = new Tom()
  tom.test('one', function () {
    return Promise.reject(new Error('broken'))
  })
  tom.on('pass', () => counts.push('test-pass'))
  tom.on('fail', () => counts.push('test-fail'))

  const runner = new TestRunner({ tom })
  runner.on('pass', () => counts.push(runner.state))
  runner.on('fail', () => counts.push(runner.state))
  counts.push(runner.state)
  runner.start()
    .then(() => {
      counts.push(runner.state)
      a.deepStrictEqual(counts, [ 'pending', 'start', 'test-fail', 'fail', 'end' ])
    })
    .catch(halt)
  counts.push(runner.state)
}
