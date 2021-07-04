import TestRunner from '../index.mjs'
import Tom from '@test-runner/tom'
import assert from 'assert'
const a = assert.strict

const tom = new Tom()

tom.test('TOM must be defined', async function () {
  const tom = undefined
  a.throws(
    () => { const runner = new TestRunner(tom) },
    /valid tom required/i
  )
})

tom.test('TOM must be of type TestObjectModel', async function () {
  const tom = {}
  a.throws(
    () => { const runner = new TestRunner(tom) },
    /valid tom required/i
  )
})

export default tom
