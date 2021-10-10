import TestRunner from '@test-runner/core'
import Tom from '@test-runner/tom'
import getAssert from 'isomorphic-assert'
import sleep from 'sleep-anywhere'
import { halt } from './lib/util.js'

async function getTom () {
  const a = await getAssert()

  { /* before and after tests run in correct order */
    async function testFn () {
      const tom = new Tom()
      const actuals = []

      tom.test('test 1', async function () {
        actuals.push(this.name)
      })

      tom.before('before 1', async function () {
        actuals.push(this.name)
      })

      tom.after('after 2', async function () {
        actuals.push(this.name)
      })

      tom.test('test 2', async function () {
        actuals.push(this.name)
      })

      const runner = new TestRunner(tom)
      await runner.start()
      a.deepEqual(actuals, ['before 1', 'test 1', 'test 2', 'after 2'])
    }
    testFn().catch(halt)
  }

  { /* multiple before and after tests */
    async function testFn () {
      const tom = new Tom()
      const actuals = []

      tom.test('test 1', async function () {
        await sleep(50)
        actuals.push(this.name)
      })

      tom.after('after 2', function () {
        actuals.push(this.name)
      })

      tom.before('before 1', async function () {
        await sleep(100)
        actuals.push(this.name)
      })

      tom.after('after 1', function () {
        actuals.push(this.name)
      })

      tom.test('test 2', async function () {
        actuals.push(this.name)
      })

      tom.before('before 2', async function () {
        actuals.push(this.name)
      })

      const runner = new TestRunner(tom)
      await runner.start()
      a.deepEqual(actuals, ['before 2', 'before 1', 'test 2', 'test 1', 'after 2', 'after 1'])
    }
    testFn().catch(halt)
  }

}

getTom()
