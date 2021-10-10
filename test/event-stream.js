import TestRunner from '@test-runner/core'
import Tom from '@test-runner/tom'
import { strict as a } from 'assert'
import sleep from 'sleep-anywhere'
import { halt } from './lib/util.js'

{ /* execution order */
  async function testFn () {
    const actuals = []
    const tom = new Tom()
    tom.test('one', () => {
      actuals.push('run: one')
    })
    tom.test('two', () => {
      actuals.push('run: two')
    })

    const runner = new TestRunner(tom)
    for await (const event of runner.eventStream()) {
      actuals.push(`${event.name}: ${event.tom.name}`)
    }
    a.deepEqual(actuals, ['in-progress: one', 'run: one', 'in-progress: two', 'run: two', 'pass: one', 'pass: two'])
  }
  testFn().catch(halt)
}

{ /* execution order, failing tests */
  async function testFn () {
    const actuals = []
    const tom = new Tom()
    tom.test('one', () => {
      actuals.push('run: one')
      throw new Error('broken')
    })
    tom.test('two', () => {
      actuals.push('run: two')
      throw new Error('broken2')
    })

    const runner = new TestRunner(tom)
    for await (const event of runner.eventStream()) {
      actuals.push(`${event.name}: ${event.tom.name}`)
    }
    a.deepEqual(actuals, ['in-progress: one', 'run: one', 'in-progress: two', 'run: two', 'fail: one', 'fail: two'])
  }
  testFn().catch(halt)
}
