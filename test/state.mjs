import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/dist/index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'

{ /* runner states: pass */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => 1)
  tom.test('two', () => 2)
  tom.on('pass', () => counts.push('test-pass'))
  tom.on('fail', () => counts.push('test-fail'))

  const runner = new TestRunner({ tom })
  counts.push('prop:' + runner.state)
  runner.on('state', state => counts.push('event:' + state))
  a.deepStrictEqual(runner.ended, false)
  runner.start()
    .then(() => {
      counts.push('prop:' + runner.state)
      a.deepStrictEqual(counts, [ 'prop:pending', 'event:in-progress', 'prop:in-progress', 'test-pass', 'test-pass', 'event:pass', 'prop:pass' ])
      a.deepStrictEqual(runner.ended, true)
    })
    .catch(halt)
  counts.push('prop:' + runner.state)
}

{ /* runner states: fail */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => {
    throw new Error('broken')
  })
  tom.test('two', () => 2)
  tom.on('pass', () => counts.push('test-pass'))
  tom.on('fail', () => counts.push('test-fail'))

  const runner = new TestRunner({ tom })
  counts.push('prop:' + runner.state)
  runner.on('state', state => counts.push('event:' + state))
  a.deepStrictEqual(runner.ended, false)
  runner.start()
    .then(() => {
      counts.push('prop:' + runner.state)
      a.deepStrictEqual(counts, [ 'prop:pending', 'event:in-progress', 'prop:in-progress', 'test-fail', 'test-pass', 'event:fail', 'prop:fail' ])
      a.deepStrictEqual(runner.ended, true)
    })
    .catch(halt)
  counts.push('prop:' + runner.state)
}

{ /* runner states: fail, reject */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => {
    return Promise.reject(new Error('broken'))
  })
  tom.test('two', () => 2)
  tom.on('pass', () => counts.push('test-pass'))
  tom.on('fail', () => counts.push('test-fail'))

  const runner = new TestRunner({ tom })
  counts.push('prop:' + runner.state)
  runner.on('state', state => counts.push('event:' + state))
  a.deepStrictEqual(runner.ended, false)
  runner.start()
    .then(() => {
      counts.push('prop:' + runner.state)
      a.deepStrictEqual(counts, [ 'prop:pending', 'event:in-progress', 'prop:in-progress', 'test-pass', 'test-fail', 'event:fail', 'prop:fail' ])
      a.deepStrictEqual(runner.ended, true)
    })
    .catch(halt)
  counts.push('prop:' + runner.state)
}
