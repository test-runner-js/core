import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/dist/index.mjs'
import assert from 'assert'
const a = assert.strict

const tom = new Tom()

tom.skip('runner.start(): results array', async function () {
  const tom = new Tom()
  tom.test('one', () => 1)
  tom.test('two', () => 2)

  const runner = new TestRunner({ tom })
  const results = await runner.start()
  a.deepStrictEqual(results, [undefined, 1, 2])
})

tom.skip('runner.start(): fail results and events', async function () {
  const tom = new Tom()
  tom.test('one', () => {
    throw new Error('broken')
  })
  tom.test('two', () => {
    throw new Error('broken2')
  })

  const runner = new TestRunner({ tom })
  const results = await runner.start()
  a.deepStrictEqual(results, [undefined, undefined])
})

tom.skip('runner.start(): pass, fail, skip events', async function () {
  const counts = []
  const tom = new Tom()
  tom.test('one', () => true)
  tom.test('two', () => { throw new Error('fail') })
  tom.skip('three', () => true)

  const runner = new TestRunner({ tom })
  runner.tom.on('pass', () => counts.push('pass'))
  runner.tom.on('fail', () => counts.push('fail'))
  runner.tom.on('skip', () => counts.push('skip'))
  const results = await runner.start()
  a.deepStrictEqual(counts, ['pass', 'fail', 'skip'])
})

tom.skip('runner.start(): only', async function () {
  const counts = []
  const tom = new Tom()
  tom.test('one', () => 1)
  tom.test('two', () => 2)
  tom.only('three', () => 3)

  const runner = new TestRunner({ tom })
  runner.tom.on('pass', () => counts.push('pass'))
  runner.tom.on('fail', () => counts.push('fail'))
  runner.tom.on('skip', () => counts.push('skip'))
  const results = await runner.start()
  a.deepStrictEqual(counts, ['skip', 'skip', 'pass'])
})

tom.skip('runner.start(): deep only', async function () {
  const counts = []
  const tom = new Tom()
  const one = tom.only('one', () => 1)
  const two = one.test('two', () => 2)
  const three = two.only('three', () => 3)

  const runner = new TestRunner({ tom })
  runner.tom.on('pass', () => counts.push('pass'))
  runner.tom.on('fail', () => counts.push('fail'))
  runner.tom.on('skip', () => counts.push('skip'))
  const results = await runner.start()
  a.deepStrictEqual(results, [1, undefined, 3])
  a.deepStrictEqual(counts, ['pass', 'skip', 'pass'])
})

tom.skip('runner.start(): deep only with fail', async function () {
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
  const results = await runner.start()
  a.deepStrictEqual(results, [1, undefined, undefined])
  a.deepStrictEqual(counts, ['pass', 'skip', 'fail'])
})

tom.skip('runner.start(): deep only with skipped fail', async function () {
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
  const results = await runner.start()
  a.deepStrictEqual(results, [1, undefined, undefined])
  a.deepStrictEqual(counts, ['pass', 'skip', 'skip'])
})

export default tom
