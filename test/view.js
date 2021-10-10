import TestRunnerCore from '../index.js'
import Tom from '@test-runner/tom'
import { strict as a } from 'assert'
import { halt } from './lib/util.js'

{ /* custom view */
  async function testFn () {
    const actuals = []
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

    const runner = new TestRunnerCore(tom, { view: new View() })
    const results = await runner.start()
    a.deepEqual(actuals, ['start', 'one', 'testPass: 1', 'two', 'testPass: 2', 'end'])
  }
  testFn().catch(halt)
}
