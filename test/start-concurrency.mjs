import TestRunner from '../index.mjs'
import Test from '../node_modules/test-object-model/dist/index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'
import sleep from '../node_modules/sleep-anywhere/index.mjs'

{ /* concurrency usage */
  // TODO: ensure only one test runs at a time
  let actuals = []
  const tom = new Test({ concurrency: 1 })
  tom.test('one', () => {
    sleep(30)
    actuals.push(1)
  })
  tom.test('two', () => {
    sleep(20)
    actuals.push(1.1)
  })
  tom.test(() => {
    sleep(50)
    actuals.push(1.2)
  })
  tom.test(() => {
    sleep(10)
    actuals.push(2)
  })
  tom.test(() => {
    sleep(40)
    actuals.push(2.1)
  })
  tom.test(() => {
    sleep(60)
    actuals.push(2.2)
  })

  const runner = new TestRunner({ tom })
  runner.start()
    .then(() => {
      a.deepStrictEqual(actuals, [ 1, 1.1, 1.2, 2, 2.1, 2.2 ])
    })
    .catch(halt)
}
