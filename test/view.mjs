import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/index.mjs'
import a from 'assert'

function halt (err) {
  console.log(err)
  process.exitCode = 1
}

{ /* custom view */
  let counts = []
  const root = new Tom('root')
  root.add(new Tom('one', () => counts.push('one')))
  root.add(new Tom('two', () => counts.push('two')))

  const view = ViewBase => class extends ViewBase {
    start () {
      counts.push('start')
    }
    end () {
      counts.push('end')
    }
    testPass (test, result) {
    }
    testFail (test, err) {
    }
    testSkip (test) {
    }
  }

  const runner = new TestRunner({ view, tom: root })
  runner.start()
    .then(root => a.deepStrictEqual(counts, [ 'start', 'one', 'two', 'end' ]))
    .catch(halt)
}
