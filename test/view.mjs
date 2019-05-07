import TestRunnerCore from '../index.mjs'
import Tom from '../node_modules/test-object-model/dist/index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'

{ /* custom view */
  let actuals = []
  const tom = new Tom()
  tom.test('one', () => {
    actuals.push('one')
    return 1
  })
  tom.test('two', async () => {
    actuals.push('two')
    return 2
  })

  class View {
    start () {
      actuals.push('start')
    }
    end () {
      actuals.push('end')
    }
    testPass (test, result) {
      actuals.push('testPass: ' + result)
    }
    testFail (test, err) {
      actuals.push('testFail')
    }
    testSkip (test) {
      actuals.push('testSkip')
    }
  }

  const runner = new TestRunnerCore({ view: new View(), tom })
  runner.start()
    .then(() => a.deepStrictEqual(actuals, [ 'start', 'one', 'testPass: 1', 'two', 'testPass: 2', 'end' ]))
    .catch(halt)
}
