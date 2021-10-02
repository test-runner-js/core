import Tom from '@test-runner/tom'
import Queue from '../lib/queue.js'
import assert from 'assert'
import sleep from 'sleep-anywhere'
const a = assert.strict

const tom = new Tom()

function createJob (ms, result) {
  return async function () {
    return sleep(ms, result)
  }
}

tom.test('queue', async function () {
  const queue = new Queue([
    createJob(30, 1),
    createJob(20, 1.1),
    createJob(50, 1.2)
  ], 1)

  const results = await queue.process()
  a.deepEqual(results, [1, 1.1, 1.2])
})

export default tom
