import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/dist/index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'

{ /* runner.start(): results array */
  const tom = new Tom()
  tom.test('one', () => {
    return 1
  })
  tom.test('two', () => {
    return 2
  })

  const runner = new TestRunner({ tom })
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [undefined, 1, 2])
    })
    .catch(halt)
}

{ /* runner.start(): fail results and events */
  const tom = new Tom()
  tom.test('one', () => {
    throw new Error('broken')
  })
  tom.test('two', () => {
    throw new Error('broken2')
  })

  const runner = new TestRunner({ tom })
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [undefined, undefined])
    })
    .catch(halt)
}

{ /* runner.start(): pass, fail, skip events */
  const counts = []
  const tom = new Tom()
  tom.test('one', () => true)
  tom.test('two', () => { throw new Error('fail') })
  tom.skip('three', () => true)

  const runner = new TestRunner({ tom })
  runner.tom.on('pass', () => counts.push('pass'))
  runner.tom.on('fail', () => counts.push('fail'))
  runner.tom.on('skip', () => counts.push('skip'))
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, ['pass', 'fail', 'skip'])
    })
    .catch(halt)
}

{ /* runner.start(): only */
  const counts = []
  const tom = new Tom()
  tom.test('one', () => 1)
  tom.test('two', () => 2)
  tom.only('three', () => 3)

  const runner = new TestRunner({ tom })
  runner.tom.on('pass', () => counts.push('pass'))
  runner.tom.on('fail', () => counts.push('fail'))
  runner.tom.on('skip', () => counts.push('skip'))
  runner.start()
    .then(results => {
      // a.deepStrictEqual(results, [ undefined, undefined, 3 ])
      a.deepStrictEqual(counts, ['skip', 'skip', 'pass'])
    })
    .catch(halt)
}

{ /* runner.start(): deep only */
  const counts = []
  const tom = new Tom()
  const one = tom.only('one', () => 1)
  const two = one.test('two', () => 2)
  const three = two.only('three', () => 3)

  const runner = new TestRunner({ tom })
  runner.tom.on('pass', () => counts.push('pass'))
  runner.tom.on('fail', () => counts.push('fail'))
  runner.tom.on('skip', () => counts.push('skip'))
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [1, undefined, 3])
      a.deepStrictEqual(counts, ['pass', 'skip', 'pass'])
    })
    .catch(halt)
}

{ /* runner.start(): deep only with fail */
  const counts = []
  const tom = new Tom()
  const one = tom.only('one', () => 1)
  const two = one.test('two', () => 2)
  const three = two.only('three', () => {
    throw new Error('broken')
  })

  const runner = new TestRunner({ tom })
  runner.tom.on('pass', () => counts.push('pass'))
  runner.tom.on('fail', () => counts.push('fail'))
  runner.tom.on('skip', () => counts.push('skip'))
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [1, undefined, undefined])
      a.deepStrictEqual(counts, ['pass', 'skip', 'fail'])
    })
    .catch(halt)
}

{ /* runner.start(): deep only with skipped fail */
  const counts = []
  const tom = new Tom()
  const one = tom.only('one', () => 1)
  const two = one.test('two', () => 2)
  const three = two.skip('three', () => {
    throw new Error('broken')
  })

  const runner = new TestRunner({ tom })
  runner.tom.on('pass', () => counts.push('pass'))
  runner.tom.on('fail', () => counts.push('fail'))
  runner.tom.on('skip', () => counts.push('skip'))
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [1, undefined, undefined])
      a.deepStrictEqual(counts, ['pass', 'skip', 'skip'])
    })
    .catch(halt)
}
