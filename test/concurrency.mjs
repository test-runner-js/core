import TestRunner from '../index.mjs'
import Test from '../node_modules/test-object-model/index.mjs'
import a from 'assert'
import { halt, sleep } from './lib/util.mjs'

{ /* concurrency usage */
  let counts = []
  const tom = new Test({ concurrency: 1 })
  tom
    .test(() => sleep(30, 1))
    .test(() => sleep(20, 1.1))
    .test(() => sleep(50, 1.2))
  tom
    .test(() => sleep(10, 2))
    .test(() => sleep(40, 2.1))
    .test(() => sleep(60, 2.2))

  const runner = new TestRunner({ tom })
  runner.start().then(results => {
    a.deepStrictEqual(results, [ 1, 1.1, 1.2, 2, 2.1, 2.2 ])
  })
}
