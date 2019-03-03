import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/dist/index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'

{ /* runner.start(): pass results and events */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => {
    counts.push('one')
  })
  tom.test('two', () => {
    counts.push('two')
  })

  const runner = new TestRunner({ tom })
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'one', 'two' ])
    })
    .catch(halt)
}

{ /* runner.start(): fail results and events */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => {
    counts.push('one')
    throw new Error('broken')
  })
  tom.test('two', () => {
    counts.push('two')
    throw new Error('broken2')
  })

  const runner = new TestRunner({ tom })
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'one', 'two' ])
    })
    .catch(halt)
}

{ /* runner.start(): pass, fail, skip events */
  let counts = []
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
      a.deepStrictEqual(counts, [ 'pass', 'fail', 'skip' ])
    })
    .catch(halt)
}

{ /* runner.start(): only */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => 1)
  tom.test('two', () => 2)
  tom.only('three', () => 3)

  const runner = new TestRunner({ tom })
  runner.tom.on('pass', () => counts.push('pass'))
  runner.tom.on('fail', () => counts.push('fail'))
  runner.tom.on('skip', () => counts.push('skip'))
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'skip', 'skip', 'pass' ])
    })
    .catch(halt)
}

{ /* runner.start(): deep only */
  let counts = []
  const tom = new Tom()
  const one = tom.only('one', () => 1)
  const two = one.test('two', () => 2)
  const three = two.only('three', () => 3)

  const runner = new TestRunner({ tom })
  runner.tom.on('pass', () => counts.push('pass'))
  runner.tom.on('fail', () => counts.push('fail'))
  runner.tom.on('skip', () => counts.push('skip'))
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'pass', 'skip', 'pass' ])
    })
    .catch(halt)
}

{ /* runner.start(): deep only with fail */
  let counts = []
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
    .then(() => {
      a.deepStrictEqual(counts, [ 'pass', 'skip', 'fail' ])
    })
    .catch(halt)
}

{ /* runner.start(): deep only with skipped fail */
  let counts = []
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
    .then(() => {
      a.deepStrictEqual(counts, [ 'pass', 'skip', 'skip' ])
    })
    .catch(halt)
}
