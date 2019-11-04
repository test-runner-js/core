import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/dist/index.mjs'
import assert from 'assert'
const a = assert.strict

const tom = new Tom()

tom.test('this.index', async function () {
  const tom = new Tom()
  const actuals = []
  tom.test('one', function () {
    actuals.push(this.index)
  })
  tom.test('two', function () {
    actuals.push(this.index)
  })

  const runner = new TestRunner(tom)
  const results = await runner.start()
  a.deepEqual(actuals, [1, 2])
  a.equal(tom.index, 1)
  a.equal(tom.children[0].index, 1)
  a.equal(tom.children[1].index, 2)
})

// { /* ctx.index: pass ctx as the final arg so `this` is not the only way to access it */
//   const tom = new Tom()
//   const actuals = []
//   tom.test('one', (...args, ctx) => {
//     actuals.push(ctx.index)
//   })
//   tom.test('two', (...args, ctx) => {
//     actuals.push(ctx.index)
//   })

//   const runner = new TestRunner(tom)
//   runner.start()
//     .then(results => {
//       a.deepEqual(actuals, [ 1, 2 ])
//     })
//     .catch(halt)
// }

export default tom
