import Tom from '@test-runner/tom'
import TestRunner from '@test-runner/core'
import { strict as a } from 'assert'

const tom = new Tom()

tom.test('simple tom', async function () {
  const actuals = []
  const tom = new Tom()
  tom.test('one', () => {
    actuals.push('one')
  })
  tom.test('two', () => {
    actuals.push('two')
  })

  const runner = new TestRunner(tom)
  await runner.start()
  a.deepEqual(actuals, ['one', 'two'])
})

tom.test('with before and after', async function () {
  const actuals = []
  const tom = new Tom()
  tom.after('one', () => {
    actuals.push('one')
  })
  tom.test('two', () => {
    actuals.push('two')
  })
  tom.before('three', () => {
    actuals.push('three')
  })

  const runner = new TestRunner(tom)
  await runner.start()
  a.deepEqual(actuals, ['three', 'two', 'one'])
})

tom.test('with before and after, deep', async function () {
  const actuals = []
  const tom = new Tom()
  tom.after('one', () => {
    actuals.push('one')
  })
  tom.test('two', () => {
    actuals.push('two')
  })
  tom.before('three', () => {
    actuals.push('three')
  })
  const group = new Tom()
  group.after('group one', () => {
    actuals.push('group one')
  })
  group.test('group two', () => {
    actuals.push('group two')
  })
  group.before('group three', () => {
    actuals.push('group three')
  })
  tom.add(group)

  const runner = new TestRunner(tom)
  await runner.start()
  a.deepEqual(actuals, ['three', 'two', 'group three', 'group two', 'group one', 'one'])
})

tom.test('one failing test', async function () {
  const actuals = []
  const tom = new Tom()
  tom.test('one', () => {
    actuals.push('one')
    throw new Error('broken')
  })
  tom.test('two', () => {
    actuals.push('two')
  })

  const runner = new TestRunner(tom)
  await runner.start()
  a.deepEqual(actuals, ['one', 'two'])
})

export default tom
