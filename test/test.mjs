import Test from '../lib/test.mjs'

const tests = []

tests.push(function (assert) {
  const test = new Test('passing sync test', () => true)
  return test.run()
    .then(result => {
      assert(result === true)
    })
    .catch(err => {
      console.log(err)
      assert(false, 'should not reach here')
    })
})

tests.push(function (assert) {
  const test = new Test('failing sync test', function () {
    throw new Error('failed')
  })
  return test.run()
    .then(() => {
      assert(false, "shouldn't reach here")
    })
    .catch(err => {
      assert(/failed/.test(err.message))
    })
})

tests.push(function (assert) {
  const test = new Test('passing async test', function () {
    return Promise.resolve(true)
  })
  return test.run().then(result => {
    assert(result === true)
  })
})

tests.push(function (assert) {
  const test = new Test('failing async test: rejected', function () {
    return Promise.reject(new Error('failed'))
  })
  return test.run()
    .then(() => {
      assert(false, "shouldn't reach here")
    })
    .catch(err => {
      assert(/failed/.test(err.message))
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
    .then(() => assert(false, 'should not reach here'))
    .catch(err => {
      assert(/Timeout expired/.test(err.message))
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
      assert(result === 'ok')
    })
    .catch(err => {
      console.log(err)
      assert(false, 'should not reach here')
    })
})

function testSuite (assert) {
  return Promise.all(tests.slice(0, 1).map(t => t(assert)))
}

export default testSuite
