import Test from '../lib/test.mjs'
import a from 'assert'

function halt (err) {
  console.log(err)
  process.exitCode = 1
}

{
  const test = new Test('passing sync test', () => true)
  test.run()
    .then(result => {
      a.ok(result === true)
    })
    .catch(halt)
}

{
  const test = new Test('failing sync test', function () {
    throw new Error('failed')
  })
  test.run()
    .then(() => {
      a.ok(false, "shouldn't reach here")
    })
    .catch(err => {
      a.ok(/failed/.test(err.message))
    })
    .catch(halt)
}

{
  const test = new Test('passing async test', function () {
    return Promise.resolve(true)
  })
  test.run().then(result => {
    a.ok(result === true)
  })
}

{
  const test = new Test('failing async test: rejected', function () {
    return Promise.reject(new Error('failed'))
  })
  test.run()
    .then(() => {
      a.ok(false, "shouldn't reach here")
    })
    .catch(err => {
      a.ok(/failed/.test(err.message))
    })
    .catch(halt)
}

{
  const test = new Test(
    'failing async test: timeout',
    function () {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 300)
      })
    },
    { timeout: 150 }
  )
  test.run()
    .then(() => a.ok(false, 'should not reach here'))
    .catch(err => {
      a.ok(/Timeout expired/.test(err.message))
    })
    .catch(halt)
}

{
  const test = new Test(
    'passing async test: timeout 2',
    function () {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve('ok'), 300)
      })
    },
    { timeout: 350 }
  )
  test.run()
    .then(result => {
      a.ok(result === 'ok')
    })
    .catch(halt)
}
