export function halt (err) {
  console.log(err)
  console.log('actual', err.actual)
  console.log('expected', err.expected)
  process.exitCode = 1
}
