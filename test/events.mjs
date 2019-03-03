import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/dist/index.mjs'
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

{ /* runner events: start, test-pass, end */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => 1)
  tom.test('two', () => 2)

  const runner = new TestRunner({ tom })
  runner.on('start', () => counts.push('start'))
  runner.on('end', () => counts.push('end'))
  runner.on('test-pass', () => counts.push('test-pass'))
  setTimeout(() => {
    a.deepStrictEqual(counts, [ 'start', 'test-pass', 'test-pass', 'end' ])
  }, 100)
  runner.start()
}
