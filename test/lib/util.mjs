export function halt (err) {
  console.log(err)
  process.exitCode = 1
}
