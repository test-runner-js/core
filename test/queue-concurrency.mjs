import TestRunner from '../index.mjs'
import Test from '../node_modules/test-object-model/dist/index.mjs'
import a from 'assert'
import { halt, sleep } from './lib/util.mjs'

{ /* concurrency usage */
  let counts = []
  const tom = new Test({ concurrency: 1 })
  tom
    .test(() => {
      sleep(30)
      counts.push(1)
    })
    .test(() => {
      sleep(20)
      counts.push(1.1)
    })
    .test(() => {
      sleep(50)
      counts.push(1.2)
    })
  tom
    .test(() => {
      sleep(10)
      counts.push(2)
    })
    .test(() => {
      sleep(40)
      counts.push(2.1)
    })
    .test(() => {
      sleep(60)
      counts.push(2.2)
    })

  const runner = new TestRunner({ tom })
  runner.start().then(() => {
    a.deepStrictEqual(counts, [ 1, 1.1, 1.2, 2, 2.1, 2.2 ])
  })
}
