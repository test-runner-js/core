import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'

{ /* new TestRunner: no tom */
  try {
    const runner = new TestRunner()
  } catch (err) {
    if (!/tom required/i.test(err.message)) halt(err)
  }
}

{ /* runner states: pass */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => 1)

  const runner = new TestRunner({ tom })
  runner.on('pass', () => counts.push(runner.state))
  runner.on('fail', () => counts.push(runner.state))
  counts.push(runner.state)
  runner.start()
    .then(() => {
      counts.push(runner.state)
      a.deepStrictEqual(counts, [ 'pending', 'start', 'pass', 'end' ])
    })
    .catch(halt)
  counts.push(runner.state)
}

{ /* runner states: fail */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => {
    throw new Error('broken')
  })

  const runner = new TestRunner({ tom })
  runner.on('pass', () => counts.push(runner.state))
  runner.on('fail', () => counts.push(runner.state))
  counts.push(runner.state)
  runner.start()
    .then(() => {
      counts.push(runner.state)
      a.deepStrictEqual(counts, [ 'pending', 'start', 'fail', 'end' ])
    })
    .catch(halt)
  counts.push(runner.state)
}

{ /* runner.start(): pass results and events */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => {
    counts.push('one')
    return 1
  })
  tom.test('two', () => {
    counts.push('two')
    return 2
  })

  const runner = new TestRunner({ tom })
  runner.start()
    .then(results => {
      a.deepStrictEqual(results, [ 1, 2 ])
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
    .then(results => {
      a.deepStrictEqual(results, [ undefined, undefined ])
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
    .then(results => {
      a.deepStrictEqual(results, [ undefined, undefined, 3 ])
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
    .then(results => {
      a.deepStrictEqual(results, [ 1, undefined, 3 ])
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
    .then(results => {
      a.deepStrictEqual(results, [ 1, undefined, undefined ])
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
    .then(results => {
      a.deepStrictEqual(results, [ 1, undefined, undefined ])
      a.deepStrictEqual(counts, [ 'pass', 'skip', 'skip' ])
    })
    .catch(halt)
}
