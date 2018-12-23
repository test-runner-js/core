import TestRunner from '../index.mjs'
import Test from 'test-object-model'
import a from 'assert'

function halt (err) {
  console.log(err)
  process.exitCode = 1
}

{ /* custom view */
  let counts = []
  const root = new Test('root')
  root.add(new Test('one', () => counts.push('one')))
  root.add(new Test('two', () => counts.push('two')))

  const view = ViewBase => class extends ViewBase {
    start () {
      counts.push('start')
    }
    end () {
      counts.push('end')
    }
  }

  const runner = new TestRunner({ view, tom: root })
  runner.start()
    .then(root => a.deepStrictEqual(counts, [ 'start', 'one', 'two', 'end' ]))
    .catch(halt)
}
