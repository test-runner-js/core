export default {
  input: 'test/tests.mjs',
  output: {
    file: 'dist/tests.js',
    format: 'cjs'
  },
  external: [ 'assert', 'http', 'node-fetch' ]
}
