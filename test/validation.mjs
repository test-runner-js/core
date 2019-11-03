import TestRunner from '../index.mjs'
import Tom from '../node_modules/test-object-model/dist/index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'

{ /* TOM must be defined */
  const tom = undefined
  try {
    const runner = new TestRunner({ tom })
    throw new Error('should not reach here')
  } catch (err) {
    a.ok(/valid tom required/i.test(err.message))
  }
}

{ /* TOM must be of type TestObjectModel */
  const tom = {}
  try {
    const runner = new TestRunner({ tom })
    throw new Error('should not reach here')
  } catch (err) {
    a.ok(/valid tom required/i.test(err.message))
  }
}
