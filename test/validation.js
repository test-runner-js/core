import TestRunner from '@test-runner/core'
import Tom from '@test-runner/tom'
import { strict as a } from 'assert'
import { halt } from './lib/util.js'

{ /* TOM must be defined */
  async function testFn () {
    const tom = undefined
    a.throws(
      () => { const runner = new TestRunner(tom) },
      /valid tom required/i
    )
  }
  testFn().catch(halt)
}

{ /* TOM must be of type TestObjectModel */
  async function testFn () {
    const tom = {}
    a.throws(
      () => { const runner = new TestRunner(tom) },
      /valid tom required/i
    )
  }
  testFn().catch(halt)
}
