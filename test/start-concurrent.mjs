import Tom from '../node_modules/test-object-model/dist/index.mjs'
import TestRunner from '../index.mjs'
import assert from 'assert'
const a = assert.strict
import sleep from '../node_modules/sleep-anywhere/index.mjs'

const tom = new Tom()

tom.test('runner.start(): execution order', async function () {
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
  a.deepStrictEqual(counts, ['one', 'two'])
})

tom.test('runner.start(): execution order 2', async function () {
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
  a.deepStrictEqual(counts, ['one', 'two'])
})

tom.test('run in parallel', async function () {
  const actuals = []
  const tom = new Tom()
  tom.test('one', async () => {
    await sleep(30)
    actuals.push(1)
  })
  tom.test('two', async () => {
    await sleep(20)
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
  a.deepStrictEqual(actuals, [2, 1.1, 1, 2.1, 1.2, 2.2])
})

export default tom
