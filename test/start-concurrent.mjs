import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/dist/index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'

{ /* runner.start(): execution order */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => {
    counts.push('one')
  })
  tom.test('two', () => {
    counts.push('two')
  })

  const runner = new TestRunner({ tom })
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'one', 'two' ])
    })
    .catch(halt)
}

{ /* runner.start(): execution order 2 */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => {
    counts.push('one')
    throw new Error('broken')
  })
  tom.test('two', () => {
    counts.push('two')
    throw new Error('broken2')
  })

  const runner = new TestRunner({ tom })
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'one', 'two' ])
    })
    .catch(halt)
}
