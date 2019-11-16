import TestRunner from '../index.mjs'
import Tom from 'test-object-model'
import assert from 'assert'
const a = assert.strict

const tom = new Tom()

tom.test('runner states: pass', async function () {
  const counts = []
  const tom = new Tom()
  tom.test('one', () => 1)
  tom.test('two', () => 2)
  tom.on('pass', () => counts.push('test-pass'))
  tom.on('fail', () => counts.push('test-fail'))

  const runner = new TestRunner(tom)
  counts.push('prop:' + runner.state)
  runner.on('state', state => counts.push('event:' + state))
  a.deepEqual(runner.ended, false)
  const promise = runner.start()
    .then(() => {
      counts.push('prop:' + runner.state)
      a.deepEqual(counts, ['prop:pending', 'event:in-progress', 'prop:in-progress', 'test-pass', 'test-pass', 'event:pass', 'prop:pass'])
      a.deepEqual(runner.ended, true)
    })
  counts.push('prop:' + runner.state)
  return promise
})

tom.test('runner states: fail', async function () {
  const counts = []
  const tom = new Tom()
  tom.test('one', () => {
    throw new Error('broken')
  })
  tom.test('two', () => 2)
  tom.on('pass', () => counts.push('test-pass'))
  tom.on('fail', () => counts.push('test-fail'))

  const runner = new TestRunner(tom)
  counts.push('prop:' + runner.state)
  runner.on('state', state => counts.push('event:' + state))
  a.deepEqual(runner.ended, false)
  const promise = runner.start()
    .then(() => {
      counts.push('prop:' + runner.state)
      a.deepEqual(counts, ['prop:pending', 'event:in-progress', 'prop:in-progress', 'test-fail', 'test-pass', 'event:fail', 'prop:fail'])
      a.deepEqual(runner.ended, true)
    })
  counts.push('prop:' + runner.state)
  return promise
})

tom.test('runner states: fail, reject', async function () {
  const counts = []
  const tom = new Tom()
  tom.test('one', () => {
    return Promise.reject(new Error('broken'))
  })
  tom.test('two', () => 2)
  tom.on('pass', () => counts.push('test-pass'))
  tom.on('fail', () => counts.push('test-fail'))

  const runner = new TestRunner(tom)
  counts.push('prop:' + runner.state)
  runner.on('state', state => counts.push('event:' + state))
  a.deepEqual(runner.ended, false)
  const promise = runner.start()
    .then(() => {
      counts.push('prop:' + runner.state)
      a.deepEqual(counts, ['prop:pending', 'event:in-progress', 'prop:in-progress', 'test-pass', 'test-fail', 'event:fail', 'prop:fail'])
      a.deepEqual(runner.ended, true)
    })
  counts.push('prop:' + runner.state)
  return promise
})

export default tom
