import Test from '../lib/test.mjs'
import a from 'assert'

{
  const test = new Test('simple', function () {
    return true
  })
  const result = test.run()
  a.strictEqual(result, true)
}

{
  const test = new Test('failing test', function () {
    throw new Error('failed')
  })
  a.throws(
    () => test.run(),
    /failed/
  )
}
