import Tom from 'test-object-model'
import TestRunner from '../index.mjs'
import a from 'assert'

const tom = new Tom()

tom.test('new TestRunner: no tom', async function () {
  a.throws(
    () => { const runner = new TestRunner() },
    /tom required/i
  )
})

export default tom
