export default {
  input: 'test/node/node-tests.mjs',
  output: {
    file: 'dist/test/node/node-tests.js',
    format: 'cjs'
  },
  external: [ 'assert', 'events' ]
}