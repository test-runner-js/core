import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/index.mjs'
import a from 'assert'
import { halt, sleep } from './lib/util.mjs'

{ /* concurrency usage */
  let counts = []
  const tom = new Tom({ concurrency: 1 })
  tom
    .test(() => sleep(500, 1))
    .test(() => sleep(500, 1.1))
    .test(() => sleep(500, 1.2))
  tom
    .test(() => sleep(500, 2))
    .test(() => sleep(500, 2.1))
    .test(() => sleep(500, 2.2))

  const runner = new TestRunner({ tom })
  runner.start()
}
