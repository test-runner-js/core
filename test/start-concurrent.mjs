import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/dist/index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'
import sleep from '../node_modules/sleep-anywhere/index.mjs'

{ /* runner.start(): execution order */
  const counts = []
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
      a.deepStrictEqual(counts, ['one', 'two'])
    })
    .catch(halt)
}

{ /* runner.start(): execution order 2 */
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

  const runner = new TestRunner({ tom })
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, ['one', 'two'])
    })
    .catch(halt)
}

{ /* run in parallel */
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

  const runner = new TestRunner({ tom })
  runner.start()
    .then(() => {
      a.deepStrictEqual(actuals, [2, 1.1, 1, 2.1, 1.2, 2.2])
    })
    .catch(halt)
}
