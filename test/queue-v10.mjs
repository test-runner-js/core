import Queue from '../lib/queue-v10.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'
import sleep from '../node_modules/sleep-anywhere/index.mjs'

async function start () { 
  {
    /* async iterator, maxConcurrency 1 */
    // TODO: ensure only one test runs at a time
    let counts = []
    function createJob (ms, result) {
      return function () {
        sleep(ms)
        return result
      }
    }
    const queue = new Queue([
      createJob(30, 1),
      createJob(20, 1.1),
      createJob(50, 1.2),
    ], 1)

    for await (const result of queue) {
      counts.push(result)
    }
    a.deepStrictEqual(counts, [ 1, 1.1, 1.2 ])
  }
}

start().catch(halt)
