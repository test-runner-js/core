import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/index.mjs'
import a from 'assert'

function halt (err) {
  console.log(err)
  process.exitCode = 1
}

{ /* custom view */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => counts.push('one'))
  tom.test('two', () => counts.push('two'))

  const view = ViewBase => class extends ViewBase {
    start () {
      counts.push('start')
    }
    end () {
      counts.push('end')
    }
    testPass (test, result) {
      counts.push('testPass')
    }
    testFail (test, err) {
      counts.push('testFail')
    }
    testSkip (test) {
      counts.push('testSkip')
    }
  }

  const runner = new TestRunner({ view, tom })
  runner.start()
    .then(() => a.deepStrictEqual(counts, [ 'start', 'one', 'testPass', 'two', 'testPass', 'end' ]))
    .catch(halt)
}
