import TestRunner from '@test-runner/core'
import Tom from '@test-runner/tom'
import { strict as a } from 'assert'
import { halt } from './lib/util.js'

{ /* runner states: pass */
  async function testFn () {
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
  }
  testFn().catch(halt)
}

{ /* runner states: fail */
  async function testFn () {
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
  }
  testFn().catch(halt)
}

{ /* runner states: fail, reject */
  async function testFn () {
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
  }
  testFn().catch(halt)
}

{ /* tom states: all pass or ignored */
  async function testFn () {
    const counts = []
    const tom = new Tom()
    tom.test('one', () => 1)
    tom.test('two', () => 2)

    const runner = new TestRunner(tom)
    await runner.start()
    const result = [tom.state, tom.children[0].state, tom.children[1].state]
    a.deepEqual(result, ['ignored', 'pass', 'pass'])
  }
  testFn().catch(halt)
}
