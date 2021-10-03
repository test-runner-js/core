import Tom from '@test-runner/tom'
import TestRunner from '@test-runner/core'
import assert from 'assert'
import sleep from '../node_modules/sleep-anywhere/index.js'
const a = assert.strict

const tom = new Tom()

tom.test('execution order', async function () {
  const counts = []
  const tom = new Tom()
  tom.test('one', () => {
    counts.push('one')
  })
  tom.test('two', () => {
    counts.push('two')
  })

  const runner = new TestRunner(tom)
  const results = await runner.start()
  a.deepEqual(counts, ['one', 'two'])
})

tom.test('execution order, failing tests', async function () {
  const counts = []
  const tom = new Tom()
  tom.test('one', () => {
    counts.push('one')
    throw new Error('broken')
  })
  tom.test('two', () => {
    counts.push('two')
    throw new Error('broken2')
  })

  const runner = new TestRunner(tom)
  const results = await runner.start()
  a.deepEqual(counts, ['one', 'two'])
})

tom.test('multiple tests run in parallel', async function () {
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
})

tom.test('single test, no children', async function () {
  const counts = []
  const tom = new Tom('one', () => {
    counts.push('one')
  })

  const runner = new TestRunner(tom)
  await runner.start()
  a.deepEqual(counts, ['one'])
  a.equal(tom.state, 'pass')
})

export default tom
