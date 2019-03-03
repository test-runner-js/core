import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/dist/index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'

{ /* runner events: start, end */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => 1)
  tom.test('two', () => 2)

  const runner = new TestRunner({ tom })
  runner.on('start', () => counts.push('start'))
  runner.on('end', () => counts.push('end'))
  setTimeout(() => {
    a.deepStrictEqual(counts, [ 'start', 'end' ])
  }, 100)
  runner.start()
}

{ /* runner events: start, test-pass, end */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => 1)
  tom.test('two', () => 2)

  const runner = new TestRunner({ tom })
  runner.on('start', () => counts.push('start'))
  runner.on('end', () => counts.push('end'))
  runner.on('test-pass', () => counts.push('test-pass'))
  setTimeout(() => {
    a.deepStrictEqual(counts, [ 'start', 'test-pass', 'test-pass', 'end' ])
  }, 100)
  runner.start()
}

{ /* runner events: start, test-fail, end */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => {
    throw new Error('broken')
  })
  tom.test('two', () => {
    throw new Error('broken2')
  })

  const runner = new TestRunner({ tom })
  runner.on('start', () => counts.push('start'))
  runner.on('end', () => counts.push('end'))
  runner.on('test-pass', () => counts.push('test-pass'))
  runner.on('test-fail', () => counts.push('test-fail'))
  /* why is this in a timeout? */
  setTimeout(() => {
    a.deepStrictEqual(counts, [ 'start', 'test-fail', 'test-fail', 'end' ])
  }, 100)
  runner.start()
}

{ /* runner.start(): pass, fail, skip events */
  let counts = []
  const tom = new Tom()
  tom.test('one', () => true)
  tom.test('two', () => { throw new Error('fail') })
  tom.skip('three', () => true)

  const runner = new TestRunner({ tom })
  runner.on('test-pass', () => counts.push('test-pass'))
  runner.on('test-fail', () => counts.push('test-fail'))
  runner.on('test-skip', () => counts.push('test-skip'))
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'test-pass', 'test-fail', 'test-skip' ])
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
  runner.on('test-pass', () => counts.push('test-pass'))
  runner.on('test-fail', () => counts.push('test-fail'))
  runner.on('test-skip', () => counts.push('test-skip'))
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'test-skip', 'test-skip', 'test-pass' ])
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
  runner.on('test-pass', () => counts.push('test-pass'))
  runner.on('test-fail', () => counts.push('test-fail'))
  runner.on('test-skip', () => counts.push('test-skip'))
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'test-pass', 'test-skip', 'test-pass' ])
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
  runner.on('test-pass', () => counts.push('test-pass'))
  runner.on('test-fail', () => counts.push('test-fail'))
  runner.on('test-skip', () => counts.push('test-skip'))
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'test-pass', 'test-skip', 'test-fail' ])
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
  runner.on('test-pass', () => counts.push('test-pass'))
  runner.on('test-fail', () => counts.push('test-fail'))
  runner.on('test-skip', () => counts.push('test-skip'))
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'test-pass', 'test-skip', 'test-skip' ])
    })
    .catch(halt)
}
