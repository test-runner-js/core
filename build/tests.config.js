export default {
  input: 'test/tests.mjs',
  output: {
    file: 'tmp/test/tests.js',
    format: 'cjs'
  },
  external: [ 'assert', 'http', 'node-fetch' ]
}
