import Test from '../lib/test.mjs'
import a from 'assert'

const tests = []

tests.push(function (assert) {
  const test = new Test('passing sync test', () => true)
  return test.run()
    .then(result => {
      a.ok(result === true)
    })
    .catch(err => {
      console.log(err)
      a.ok(false, 'should not reach here')
    })
})

tests.push(function (assert) {
  const test = new Test('failing sync test', function () {
    throw new Error('failed')
  })
  return test.run()
    .then(() => {
      a.ok(false, "shouldn't reach here")
    })
    .catch(err => {
      a.ok(/failed/.test(err.message))
    })
})

tests.push(function (assert) {
  const test = new Test('passing async test', function () {
    return Promise.resolve(true)
  })
  return test.run().then(result => {
    a.ok(result === true)
  })
})

tests.push(function (assert) {
  const test = new Test('failing async test: rejected', function () {
    return Promise.reject(new Error('failed'))
  })
  return test.run()
    .then(() => {
      a.ok(false, "shouldn't reach here")
    })
    .catch(err => {
      a.ok(/failed/.test(err.message))
    })
})

tests.push(function (assert) {
  const test = new Test(
    'failing async test: timeout',
    function () {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 300)
      })
    },
    { timeout: 150 }
  )
  return test.run()
    .then(() => a.ok(false, 'should not reach here'))
    .catch(err => {
      a.ok(/Timeout expired/.test(err.message))
    })
})

tests.push(function (assert) {
  const test = new Test(
    'passing async test: timeout 2',
    function () {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve('ok'), 300)
      })
    },
    { timeout: 350 }
  )
  return test.run()
    .then(result => {
      a.ok(result === 'ok')
    })
    .catch(err => {
      a.ok(false, 'should not reach here')
    })
})

Promise.all(tests.map(t => t(a.ok)))
  .then(() => console.log('Done'))
  .catch(err => {
    console.log(err)
    process.exitCode = 1
  })
