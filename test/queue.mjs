import Queue from '../lib/queue.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'
import sleep from '../node_modules/sleep-anywhere/index.mjs'

async function start () { 
  {
    /* process(), maxConcurrency 1 */
    // TODO: ensure only one test runs at a time
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

    const results = await queue.process()
    a.deepStrictEqual(results, [ 1, 1.1, 1.2 ])
  }
}

start().catch(halt)
