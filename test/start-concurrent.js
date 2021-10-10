import Tom from '@test-runner/tom'
import TestRunner from '@test-runner/core'
import { strict as a } from 'assert'
import sleep from 'sleep-anywhere'
import { halt } from './lib/util.js'

{ /* execution order */
  async function testFn () {
    const actuals = []
    const tom = new Tom()
    tom.test('one', () => {
      actuals.push('one')
    })
    tom.test('two', () => {
      actuals.push('two')
    })

    const runner = new TestRunner(tom)
    const results = await runner.start()
    a.deepEqual(actuals, ['one', 'two'])
  }
  testFn().catch(halt)
}

{ /* execution order, failing tests */
  async function testFn () {
    const actuals = []
    const tom = new Tom()
    tom.test('one', () => {
      actuals.push('one')
      throw new Error('broken')
    })
    tom.test('two', () => {
      actuals.push('two')
      throw new Error('broken2')
    })

    const runner = new TestRunner(tom)
    const results = await runner.start()
    a.deepEqual(actuals, ['one', 'two'])
  }
  testFn().catch(halt)
}

{ /* multiple tests run in parallel */
  async function testFn () {
    const actuals = []
    const tom = new Tom()
    tom.test('one', async () => {
      await sleep(30)
      actuals.push(1)
    })
    tom.test('two', async () => {
      await sleep(15)
      actuals.push(1.1)
    })
    tom.test(async () => {
      await sleep(50)
      actuals.push(1.2)
    })
    tom.test(async () => {
      await sleep(10)
      actuals.push(2)
    })
    tom.test(async () => {
      await sleep(40)
      actuals.push(2.1)
    })
    tom.test(async () => {
      await sleep(60)
      actuals.push(2.2)
    })

    const runner = new TestRunner(tom)
    const results = await runner.start()
    a.deepEqual(actuals, [2, 1.1, 1, 2.1, 1.2, 2.2])
  }
  testFn().catch(halt)
}


{ /* single test, no children */
  async function testFn () {
    const counts = []
    const tom = new Tom('one', () => {
      counts.push('one')
    })

    const runner = new TestRunner(tom)
    await runner.start()
    a.deepEqual(counts, ['one'])
    a.equal(tom.state, 'pass')
  }
  testFn().catch(halt)
}
