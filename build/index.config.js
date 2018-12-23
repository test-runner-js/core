export default {
  input: 'index.mjs',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'TestRunner'
  },
  external: [ 'assert', 'events', 'fsm-base' ]
}
