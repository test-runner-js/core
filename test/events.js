import Tom from '@test-runner/tom'
import TestRunner from '@test-runner/core'
import { strict as a } from 'assert'
import { halt } from './lib/util.js'

{ /* runner events: two passing tests */
  async function testFn () {
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
  }
  testFn().catch(halt)
}

{ /* runner events: two failing events */
  async function testFn () {
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
  }
  testFn().catch(halt)
}

{ /* runner events: one todo test */
  async function testFn () {
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
  }
  testFn().catch(halt)
}

{ /* runner.start(): pass, fail, skip events */
  async function testFn () {
    const actuals = []
    const tom = new Tom()
    tom.test('one', function one () { return true })
    tom.test('two', function two () { throw new Error('broken') })
    tom.skip('three', function three () { return true })

    const runner = new TestRunner(tom)
    runner.on('test-pass', () => actuals.push('test-pass'))
    runner.on('test-fail', () => actuals.push('test-fail'))
    runner.on('test-skip', () => actuals.push('test-skip'))
    await runner.start()
    a.deepEqual(actuals, ['test-pass', 'test-fail', 'test-skip'])
  }
  testFn().catch(halt)
}

// tom.test('runner.start(): only', async function () {
//   const actuals = []
//   const tom = new Tom()
//   tom.test('one', () => 1)
//   tom.test('two', () => 2)
//   tom.only('three', () => 3)

//   const runner = new TestRunner(tom)
//   runner.on('test-pass', () => actuals.push('test-pass'))
//   runner.on('test-fail', () => actuals.push('test-fail'))
//   runner.on('test-skip', () => actuals.push('test-skip'))
//   await runner.start()
//   a.deepEqual(actuals, ['test-skip', 'test-skip', 'test-pass'])
// })

// tom.test('runner.start(): deep only', async function () {
//   const actuals = []
//   const tom = new Tom()
//   tom.only('one', () => 1)
//   const group = tom.group('group1')
//   group.test('two', () => 2)
//   group.only('three', () => 3)

//   const runner = new TestRunner(tom)
//   runner.on('test-pass', (t) => actuals.push(`test-pass: ${t.name}`))
//   runner.on('test-fail', (t) => actuals.push(`test-fail: ${t.name}`))
//   runner.on('test-skip', (t) => actuals.push(`test-skip: ${t.name}`))
//   await runner.start()
//   a.deepEqual(actuals, ['test-pass: one', 'test-skip: two', 'test-pass: three'])
// })

// tom.test('runner.start(): deep only with fail', async function () {
//   const actuals = []
//   const tom = new Tom()
//   tom.only('one', () => 1)
//   const group1 = tom.group('group1')
//   group1.test('two', () => 2)
//   const group2 = group1.group('group2')
//   group2.only('three', () => {
//     throw new Error('broken')
//   })

//   const runner = new TestRunner(tom)
//   runner.on('test-pass', () => actuals.push('test-pass'))
//   runner.on('test-fail', () => actuals.push('test-fail'))
//   runner.on('test-skip', () => actuals.push('test-skip'))
//   await runner.start()
//   a.deepEqual(actuals, ['test-pass', 'test-skip', 'test-fail'])
// })

// tom.test('runner.start(): deep only with skipped fail', async function () {
//   const actuals = []
//   const tom = new Tom()
//   tom.only('one', () => 1)
//   const group1 = tom.group('group1')
//   group1.test('two', () => 2)
//   const group2 = group1.group('group2')
//   group2.skip('three', () => {
//     throw new Error('broken')
//   })

//   const runner = new TestRunner(tom)
//   runner.on('test-pass', () => actuals.push('test-pass'))
//   runner.on('test-fail', () => actuals.push('test-fail'))
//   runner.on('test-skip', () => actuals.push('test-skip'))
//   await runner.start()
//   a.deepEqual(actuals, ['test-pass', 'test-skip', 'test-skip'])
// })

// export default tom
