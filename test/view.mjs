import TestRunnerCore from '../index.mjs'
import Tom from '../node_modules/test-object-model/dist/index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'

{ /* custom view */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => counts.push('one'))
  tom.test('two', () => counts.push('two'))

  class View {
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

  const runner = new TestRunnerCore({ view: new View(), tom })
  runner.start()
    .then(() => a.deepStrictEqual(counts, [ 'start', 'one', 'testPass', 'two', 'testPass', 'end' ]))
    .catch(halt)
}
