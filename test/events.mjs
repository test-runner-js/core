import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'

{ /* runner events: start */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => 1)
  tom.test('two', () => 2)

  const runner = new TestRunner({ tom })
  runner.on('start', () => counts.push('start'))
  runner.on('end', () => counts.push('end'))
  setTimeout(() => {
    a.deepStrictEqual(counts, [ 'start', 'end' ])
  }, 100)
  runner.start()
}
