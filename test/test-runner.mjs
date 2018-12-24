import TestRunner from '../index.mjs'
import Tom from 'test-object-model'
import a from 'assert'

function halt (err) {
  console.log(err)
  process.exitCode = 1
}

{ /* runner.start(): pass */
  let counts = []
  const tom = new Tom('tom')
  tom.test('one', () => counts.push('one'))
  tom.test('two', () => counts.push('two'))

  const runner = new TestRunner({ tom })
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'one', 'two' ])
      a.strictEqual(tom.children[0].state, 'pass')
      a.strictEqual(tom.children[1].state, 'pass')
    })
    .catch(halt)
}

{ /* runner.start(): fail */
  let counts = []
  const tom = new Tom('tom')
  tom.test('one', () => {
    counts.push('one')
    throw new Error('broken')
  })
  tom.test('two', () => counts.push('two'))

  const runner = new TestRunner({ tom })
  runner.start()
    .then(() => {
      a.deepStrictEqual(counts, [ 'one', 'two' ])
      a.strictEqual(tom.children[0].state, 'fail')
      a.strictEqual(tom.children[1].state, 'pass')
    })
    .catch(halt)
}

{ /* runner.start(): pass, events */
  let counts = []
  const tom = new Tom('tom')
  tom.test(new Tom('one', () => true))

  const runner = new TestRunner({ tom })
  a.strictEqual(runner.state, 'pending')
  runner.on('start', () => counts.push('start'))
  runner.start()
    .then(() => {
      a.strictEqual(runner.state, 'end')
      counts.push('end')
      a.deepStrictEqual(counts, [ 'start', 'end' ])
    })
    .catch(halt)
}

{ /* runner.start(): test events */
  let counts = []
  const tom = new Tom('tom')
  tom.test('one', () => true)
  tom.test('two', () => { throw new Error('fail') })
  tom.skip('three', () => true)

  // tom.on(function () {
  //   console.log(...arguments)
  //   console.log(this.name)
  // })

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
