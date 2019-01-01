import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/index.mjs'
import a from 'assert'
import http from 'http'
import fetch from 'node-fetch'
import { halt } from './lib/util.mjs'

{ /* timeout tests */
  let counts = []
  const tom = new Tom('Sequential tests', null, { concurrency: 1 })
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

  const runner = new TestRunner({ tom })
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [ 1, 2, 3 ])
      a.deepStrictEqual(counts, [ 1, 2, 3 ])
    })
    .catch(halt)
}
