import Tom from '@test-runner/tom'
import TestRunner from '../index.mjs'
import assert from 'assert'
const a = assert.strict

const tom = new Tom()

tom.test('runner events: two passing tests', async function () {
  const actuals = []
  const tom = new Tom()
  tom.test('one', () => 1)
  tom.test('two', () => 2)

  const runner = new TestRunner(tom)
  runner.on('start', () => actuals.push('start'))
  runner.on('end', () => actuals.push('end'))
  runner.on('test-start', () => actuals.push('test-start'))
  runner.on('test-pass', () => actuals.push('test-pass'))
  runner.on('test-fail', () => actuals.push('test-fail'))
  runner.on('test-skip', () => actuals.push('test-skip'))
  runner.on('test-ignore', () => actuals.push('test-ignore'))
  runner.on('test-todo', () => actuals.push('test-todo'))
  await runner.start()
  a.deepEqual(actuals, ['start', 'test-ignore', 'test-start', 'test-pass', 'test-start', 'test-pass', 'end'])
})

tom.test('runner events: two failing events', async function () {
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
  runner.on('test-start', () => actuals.push('test-start'))
  runner.on('test-pass', () => actuals.push('test-pass'))
  runner.on('test-fail', () => actuals.push('test-fail'))
  runner.on('test-skip', () => actuals.push('test-skip'))
  runner.on('test-ignore', () => actuals.push('test-ignore'))
  runner.on('test-todo', () => actuals.push('test-todo'))
  await runner.start()
  a.deepEqual(actuals, ['start', 'test-ignore', 'test-start', 'test-fail', 'test-start', 'test-fail', 'end'])
})

tom.test('runner events: one todo test', async function () {
  const actuals = []
  const tom = new Tom()
  tom.todo('one', () => {
    throw new Error('broken')
  })

  const runner = new TestRunner(tom)
  runner.on('start', () => actuals.push('start'))
  runner.on('end', () => actuals.push('end'))
  runner.on('test-start', () => actuals.push('test-start'))
  runner.on('test-pass', () => actuals.push('test-pass'))
  runner.on('test-fail', () => actuals.push('test-fail'))
  runner.on('test-skip', () => actuals.push('test-skip'))
  runner.on('test-ignore', () => actuals.push('test-ignore'))
  runner.on('test-todo', () => actuals.push('test-todo'))
  await runner.start()
  a.deepEqual(actuals, ['start', 'test-ignore', 'test-todo', 'end'])
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
  await runner.start()
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
  await runner.start()
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
  await runner.start()
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
  await runner.start()
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
  await runner.start()
  a.deepEqual(actuals, ['test-pass', 'test-skip', 'test-skip'])
})

export default tom
