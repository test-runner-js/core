import Queue from '../lib/queue.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'
import sleep from '../node_modules/sleep-anywhere/index.mjs'

function createJob (ms, result) {
  return async function () {
    return sleep(ms, result)
  }
}

async function start () {
  {
    const queue = new Queue([
      createJob(30, 1),
      createJob(20, 1.1),
      createJob(50, 1.2)
    ], 1)

    const results = await queue.process()
    a.deepStrictEqual(results, [1, 1.1, 1.2])
  }
}

// start().catch(halt)
