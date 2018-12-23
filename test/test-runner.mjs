import TestRunner from '../index.mjs'
import Test from '../lib/test.mjs'
import a from 'assert'

function halt (err) {
  console.log(err)
  process.exitCode = 1
}

/* SIMPLE RUNNER */

{ /* runner.start(): pass */
  let counts = []
  const root = new Test('root')
  root.add(new Test('one', () => counts.push('one')))
  root.add(new Test('two', () => counts.push('two')))

  const runner = new TestRunner(root)
  runner.start()
    .then(root => a.deepStrictEqual(counts, [ 'one', 'two' ]))
    .catch(halt)
}

{ /* runner.start(): fail */
  let counts = []
  const root = new Test('root')
  root.add(new Test('one', () => {
    counts.push('one')
    throw new Error('broken')
  }))
  root.add(new Test('two', () => counts.push('two')))

  const runner = new TestRunner(root)
  runner.start()
    .then(root => {
      throw new Error('should not reach here')
    })
    .catch(err => {
      a.strictEqual(err.message, 'broken')
      a.deepStrictEqual(counts, [ 'one', 'two' ])
    })
    .catch(halt)
}

{ /* runner.start(): pass, events */
  let counts = []
  const root = new Test('root')
  root.add(new Test('one', () => true))

  const runner = new TestRunner(root)
  a.strictEqual(runner.state, 'pending')
  runner.on('start', () => counts.push('start'))
  runner.start()
    .then(root => {
      a.strictEqual(runner.state, 'end')
      counts.push('end')
      a.deepStrictEqual(counts, [ 'start', 'end' ])
    })
    .catch(halt)
}

/* SIMPLE RUNNER, DIFFERENT VIEW */
/* MULTI-CORE RUNNER */
/* WEB RUNNER */
