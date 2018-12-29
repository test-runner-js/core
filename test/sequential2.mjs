import TestRunner from '../index.mjs'
import Tom from 'test-object-model'
import a from 'assert'
import http from 'http'
import fetch from 'node-fetch'

function halt (err) {
  console.log(err)
  process.exitCode = 1
}

{ /* server tests */
  let counts = []
  const tom = new Tom('Sequential tests')
  tom.test('one', function () {
    const server = http.createServer((req, res) => {
      setTimeout(() => {
        res.writeHead(200)
        res.end()
      }, 100)
    })
    server.listen(9000)
    return new Promise((resolve, reject) => {
      setImmediate(() => {
        fetch('http://localhost:9000/').then(response => {
          counts.push(response.status)
          resolve(response.status)
          server.close()
        })
      })
    })
  })

  tom.test('two', function () {
    const server = http.createServer((req, res) => {
      setTimeout(() => {
        res.writeHead(201)
        res.end()
      }, 10)
    })
    server.listen(9000)
    return new Promise((resolve, reject) => {
      setImmediate(() => {
        fetch('http://localhost:9000/').then(response => {
          counts.push(response.status)
          resolve(response.status)
          server.close()
        })
      })
    })
  })

  const runner = new TestRunner({ tom, sequential: true })
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [ undefined, 200, 201 ])
      a.deepStrictEqual(counts, [ 200, 201 ])
    })
    .catch(halt)
}
