import Test from '../lib/test.mjs'

function testSuite (assert) {
  {
    const test = new Test('passing sync test', function () {
      return true
    })
    test.run()
      .then(result => {
        assert(result === true)
      })
      .catch(err => {
        console.log(err)
        assert(false, 'should not reach here')
      })
  }

  {
    const test = new Test('failing sync test', function () {
      throw new Error('failed')
    })
    test.run()
      .then(() => {
        assert(false, "shouldn't reach here")
      })
      .catch(err => {
        assert(/failed/.test(err.message))
      })
  }

  {
    const test = new Test('passing async test', function () {
      return Promise.resolve(true)
    })
    test.run().then(result => {
      assert(result === true)
    })
  }

  {
    const test = new Test('failing async test: rejected', function () {
      return Promise.reject(new Error('failed'))
    })
    test.run()
      .then(() => {
        assert(false, "shouldn't reach here")
      })
      .catch(err => {
        assert(/failed/.test(err.message))
      })
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
      .then(() => assert(false, 'should not reach here'))
      .catch(err => {
        assert(/Timeout exceeded/.test(err.message))
      })
  }

  {
    const test = new Test(
      'passing async test: timeout',
      function () {
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve('ok'), 300)
        })
      },
      { timeout: 350 }
    )
    test.run()
      .then(result => {
        assert(result === 'ok')
      })
      .catch(err => {
        console.log(err)
        assert(false, 'should not reach here')
      })
  }
}

export default testSuite
