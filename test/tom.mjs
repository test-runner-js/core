import Test from '../lib/test.mjs'
import a from 'assert'

function halt (err) {
  console.log(err)
  process.exitCode = 1
}

{
  const root = new Test('new Test()')
}

{
  const root = new Test('test.tree()')
  root.add(new Test('one', () => true))
  const child = root.add(new Test('two', () => true))
  child.add(new Test('three', () => true))
  console.log(root.tree())
}
