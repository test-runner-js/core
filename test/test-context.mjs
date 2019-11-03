import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/dist/index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'

{ /* this.index */
  const tom = new Tom()
  const actuals = []
  tom.test('one', function () {
    actuals.push(this.index)
  })
  tom.test('two', function () {
    actuals.push(this.index)
  })

  const runner = new TestRunner({ tom })
  runner.start()
    .then(results => {
      a.deepStrictEqual(actuals, [1, 2])
      a.strictEqual(tom.index, 1)
      a.strictEqual(tom.children[0].index, 1)
      a.strictEqual(tom.children[1].index, 2)
    })
    .catch(halt)
}

// { /* ctx.index: pass ctx as the final arg so `this` is not the only way to access it */
//   const tom = new Tom()
//   const actuals = []
//   tom.test('one', (...args, ctx) => {
//     actuals.push(ctx.index)
//   })
//   tom.test('two', (...args, ctx) => {
//     actuals.push(ctx.index)
//   })

//   const runner = new TestRunner({ tom })
//   runner.start()
//     .then(results => {
//       a.deepStrictEqual(actuals, [ 1, 2 ])
//     })
//     .catch(halt)
// }
