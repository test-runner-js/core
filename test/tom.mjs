import Test from '../lib/test.mjs'
import a from 'assert'

function halt (err) {
  console.log(err)
  process.exitCode = 1
}

{
  const root = new Test('new Test()')
}

{
  const root = new Test('test.tree()')
  root.add(new Test('one', () => true))
  const child = root.add(new Test('two', () => true))
  child.add(new Test('three', () => true))
  console.log(root.tree())
}

{
  let count = 0
  const test = new Test('test.run()', function () {
    count++
    return true
  })
  test.run()
    .then(result => {
      a.strictEqual(result, true)
      a.strictEqual(count, 1)
    })
    .catch(halt)
}

{
  let counts = []
  const test = new Test('test.run(): event order', function () {
    counts.push('body')
    return true
  })
  a.strictEqual(test.state, 'pending')
  test.on('start', test => counts.push('start'))
  test.on('pass', test => counts.push('pass'))
  test.run()
    .then(result => {
      a.strictEqual(result, true)
      a.strictEqual(counts.length, 3)
      a.deepStrictEqual(counts, [ 'start', 'body', 'pass' ])
    })
    .catch(halt)
}
