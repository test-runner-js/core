import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/dist/index.mjs'
import assert from 'assert'
const a = assert.strict
import http from 'http'
import fetch from 'node-fetch'
import sleep from '../node_modules/sleep-anywhere/index.mjs'

const tom = new Tom()

tom.test('timeout tests', async function () {
  const counts = []
  const tom = new Tom('Sequential tests', null, { maxConcurrency: 1 })
  tom.test('one', function () {
    a.deepEqual(counts, [])
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        counts.push(1)
        resolve(1)
      }, 1000)
    })
  })

  tom.test('two', function () {
    a.deepEqual(counts, [1])
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        counts.push(2)
        resolve(2)
      }, 500)
    })
  })

  tom.test('three', function () {
    a.deepEqual(counts, [1, 2])
    counts.push(3)
    return 3
  })

  const runner = new TestRunner({ tom })
  const results = await runner.start()
  a.deepEqual(counts, [1, 2, 3])
})

tom.test('http server tests', async function () {
  const counts = []
  const tom = new Tom('Sequential tests', null, { maxConcurrency: 1 })
  tom.test('one', function () {
    const server = http.createServer((req, res) => {
      setTimeout(() => {
        res.writeHead(200)
        res.end()
      }, 100)
    })
    server.listen(9000)
    return new Promise((resolve, reject) => {
      setImmediate(() => {
        fetch('http://localhost:9000/').then(response => {
          counts.push(response.status)
          resolve(response.status)
          server.close()
        })
      })
    })
  })

  tom.test('two', function () {
    const server = http.createServer((req, res) => {
      setTimeout(() => {
        res.writeHead(201)
        res.end()
      }, 10)
    })
    server.listen(9000)
    return new Promise((resolve, reject) => {
      setImmediate(() => {
        fetch('http://localhost:9000/').then(response => {
          counts.push(response.status)
          resolve(response.status)
          server.close()
        })
      })
    })
  })

  const runner = new TestRunner({ tom })
  const results = await runner.start()
  a.deepEqual(counts, [200, 201])
})

tom.test('concurrency usage', async function () {
  const actuals = []
  const tom = new Tom({ maxConcurrency: 1 })
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
  const results = await runner.start()
  a.deepEqual(actuals, [1, 1.1, 1.2, 2, 2.1, 2.2])
})

tom.skip('deep sequential usage', async function () {
  const actuals = []
  const tom = new Tom()
  const one = tom.test('one', async () => {
    await sleep(30)
    actuals.push(1)
  }, { maxConcurrency: 1 })

  one.test(async () => {
    await sleep(50)
    actuals.push(1.2)
  })
  one.test(async () => {
    await sleep(10)
    actuals.push(2)
  })
  one.test(async () => {
    await sleep(40)
    actuals.push(2.1)
  })
  one.test(async () => {
    await sleep(60)
    actuals.push(2.2)
  })

  tom.test('two', async () => {
    await sleep(20)
    actuals.push(1.1)
  })

  const runner = new TestRunner({ tom })
  const results = await runner.start()
  a.deepEqual(actuals, [1.1, 1, 1.2, 2, 2.1, 2.2])
})

export default tom
