import Tom from '../node_modules/test-object-model/dist/index.mjs'
import TestRunner from '../index.mjs'
import assert from 'assert'
const a = assert.strict

const tom = new Tom()

tom.test('runner events: start, end', async function () {
  const actuals = []
  const tom = new Tom()
  tom.test('one', () => 1)
  tom.test('two', () => 2)

  const runner = new TestRunner(tom)
  runner.on('start', count => {
    actuals.push('start')
    a.equal(count, 2)
  })
  runner.on('end', () => actuals.push('end'))
  const results = await runner.start()
  a.deepEqual(actuals, ['start', 'end'])
})

tom.test('runner events: start, test-pass, end', async function () {
  const actuals = []
  const tom = new Tom()
  tom.test('one', () => 1)
  tom.test('two', () => 2)

  const runner = new TestRunner(tom)
  runner.on('start', () => actuals.push('start'))
  runner.on('end', () => actuals.push('end'))
  runner.on('test-pass', () => actuals.push('test-pass'))
  const results = await runner.start()
  a.deepEqual(actuals, ['start', 'test-pass', 'test-pass', 'end'])
})

tom.test('runner events: start, test-fail, end', async function () {
  const actuals = []
  const tom = new Tom()
  tom.test('one', () => {
    throw new Error('broken')
  })
  tom.test('two', () => {
    throw new Error('broken2')
  })

  const runner = new TestRunner(tom)
  runner.on('start', () => actuals.push('start'))
  runner.on('end', () => actuals.push('end'))
  runner.on('test-pass', () => actuals.push('test-pass'))
  runner.on('test-fail', () => actuals.push('test-fail'))
  const results = await runner.start()
  a.deepEqual(actuals, ['start', 'test-fail', 'test-fail', 'end'])
})

tom.test('runner.start(): pass, fail, skip events', async function () {
  const actuals = []
  const tom = new Tom()
  tom.test('one', () => true)
  tom.test('two', () => { throw new Error('fail') })
  tom.skip('three', () => true)

  const runner = new TestRunner(tom)
  runner.on('test-pass', () => actuals.push('test-pass'))
  runner.on('test-fail', () => actuals.push('test-fail'))
  runner.on('test-skip', () => actuals.push('test-skip'))
  const results = await runner.start()
  a.deepEqual(actuals, ['test-pass', 'test-fail', 'test-skip'])
})

tom.test('runner.start(): only', async function () {
  const actuals = []
  const tom = new Tom()
  tom.test('one', () => 1)
  tom.test('two', () => 2)
  tom.only('three', () => 3)

  const runner = new TestRunner(tom)
  runner.on('test-pass', () => actuals.push('test-pass'))
  runner.on('test-fail', () => actuals.push('test-fail'))
  runner.on('test-skip', () => actuals.push('test-skip'))
  const results = await runner.start()
  a.deepEqual(actuals, ['test-skip', 'test-skip', 'test-pass'])
})

tom.test('runner.start(): deep only', async function () {
  const actuals = []
  const tom = new Tom()
  const one = tom.only('one', () => 1)
  const two = one.test('two', () => 2)
  const three = two.only('three', () => 3)

  const runner = new TestRunner(tom)
  runner.on('test-pass', () => actuals.push('test-pass'))
  runner.on('test-fail', () => actuals.push('test-fail'))
  runner.on('test-skip', () => actuals.push('test-skip'))
  const results = await runner.start()
  a.deepEqual(actuals, ['test-pass', 'test-skip', 'test-pass'])
})

tom.test('runner.start(): deep only with fail', async function () {
  const actuals = []
  const tom = new Tom()
  const one = tom.only('one', () => 1)
  const two = one.test('two', () => 2)
  const three = two.only('three', () => {
    throw new Error('broken')
  })

  const runner = new TestRunner(tom)
  runner.on('test-pass', () => actuals.push('test-pass'))
  runner.on('test-fail', () => actuals.push('test-fail'))
  runner.on('test-skip', () => actuals.push('test-skip'))
  const results = await runner.start()
  a.deepEqual(actuals, ['test-pass', 'test-skip', 'test-fail'])
})

tom.test('runner.start(): deep only with skipped fail', async function () {
  const actuals = []
  const tom = new Tom()
  const one = tom.only('one', () => 1)
  const two = one.test('two', () => 2)
  const three = two.skip('three', () => {
    throw new Error('broken')
  })

  const runner = new TestRunner(tom)
  runner.on('test-pass', () => actuals.push('test-pass'))
  runner.on('test-fail', () => actuals.push('test-fail'))
  runner.on('test-skip', () => actuals.push('test-skip'))
  const results = await runner.start()
  a.deepEqual(actuals, ['test-pass', 'test-skip', 'test-skip'])
})

export default tom
