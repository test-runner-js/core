import TestRunner from '../index.mjs'
import Test from '../lib/test.mjs'
import a from 'assert'

function halt (err) {
  console.log(err)
  process.exitCode = 1
}

/* SIMPLE RUNNER */

{
  let counts = []
  const root = new Test('root')
  root.add(new Test('one', () => counts.push('one')))
  root.add(new Test('two', () => counts.push('two')))

  const runner = new TestRunner(root, { name: 'runner.start()' })
  runner.start()
    .then(root => a.deepStrictEqual(counts, [ 'one', 'two' ]))
    .catch(halt)
}

/* SIMPLE RUNNER, DIFFERENT VIEW */
/* MULTI-CORE RUNNER */
/* WEB RUNNER */
