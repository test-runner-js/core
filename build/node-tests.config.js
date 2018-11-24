export default {
  input: 'test/node-tests.mjs',
  output: {
    file: 'dist/test/node-tests.js',
    format: 'cjs'
  },
  external: [ 'assert', 'events' ]
}
