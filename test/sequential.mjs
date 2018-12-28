import TestRunner from '../index.mjs'
import Tom from 'test-object-model'
import a from 'assert'

function halt (err) {
  console.log(err)
  process.exitCode = 1
}

{
  let counts = []
  const tom = new Tom('Sequential tests')
  tom.test('one', function () {
    a.deepStrictEqual(counts, [])
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        counts.push(1)
        resolve(1)
      }, 1000)
    })
  })

  tom.test('two', function () {
    a.deepStrictEqual(counts, [ 1 ])
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        counts.push(2)
        resolve(2)
      }, 500)
    })
  })

  tom.test('three', function () {
    a.deepStrictEqual(counts, [ 1, 2 ])
    counts.push(3)
    return 3
  })

  const runner = new TestRunner({ tom, sequential: true })
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [ undefined, 1, 2, 3 ])
      a.deepStrictEqual(counts, [ 1, 2, 3 ])
    })
    .catch(halt)
}
