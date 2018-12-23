import TestRunner from '../index.mjs'
import Test from 'test-object-model'
import a from 'assert'

function halt (err) {
  console.log(err)
  process.exitCode = 1
}

/* SIMPLE RUNNER */

{ /* runner.start(): pass */
  let counts = []
  const tom = new Test('tom')
  tom.add(new Test('one', () => counts.push('one')))
  tom.add(new Test('two', () => counts.push('two')))

  const runner = new TestRunner({ tom })
  runner.start()
    .then(tom => a.deepStrictEqual(counts, [ 'one', 'two' ]))
    .catch(halt)
}

{ /* runner.start(): fail */
  let counts = []
  const tom = new Test('tom')
  tom.add(new Test('one', () => {
    counts.push('one')
    throw new Error('broken')
  }))
  tom.add(new Test('two', () => counts.push('two')))

  const runner = new TestRunner({ tom })
  runner.start()
    .then(tom => {
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
  const tom = new Test('tom')
  tom.add(new Test('one', () => true))

  const runner = new TestRunner({ tom })
  a.strictEqual(runner.state, 'pending')
  runner.on('start', () => counts.push('start'))
  runner.start()
    .then(tom => {
      a.strictEqual(runner.state, 'end')
      counts.push('end')
      a.deepStrictEqual(counts, [ 'start', 'end' ])
    })
    .catch(halt)
}

/* SIMPLE RUNNER, DIFFERENT VIEW */
/* MULTI-CORE RUNNER */
/* WEB RUNNER */
