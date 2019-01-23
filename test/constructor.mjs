import TestRunner from '../index.mjs'
import a from 'assert'
import { halt } from './lib/util.mjs'

{ /* new TestRunner: no tom */
  try {
    const runner = new TestRunner()
  } catch (err) {
    if (!/tom required/i.test(err.message)) halt(err)
  }
}
