import Test from '../lib/test.mjs'
import a from 'assert'

{
  const test = new Test('passing sync test', function () {
    return true
  })
  test.run().then(result => {
    a.strictEqual(result, true)
  })
}

{
  const test = new Test('failing sync test', function () {
    throw new Error('failed')
  })
  test.run()
    .then(() => {
      a.fail("shouldn't reach here")
    })
    .catch(err => {
      a.ok(/failed/.test(err.message))
    })
}

{
  const test = new Test('passing async test', function () {
    return Promise.resolve(true)
  })
  test.run().then(result => {
    a.strictEqual(result, true)
  })
}

{
  const test = new Test('failing async test', function () {
    return Promise.reject(new Error('failed'))
  })
  test.run()
    .then(() => {
      a.fail("shouldn't reach here")
    })
    .catch(err => {
      a.ok(/failed/.test(err.message))
    })
}
