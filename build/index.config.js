export default {
  input: 'index.mjs',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'TestRunnerCore'
  },
  external: [ 'assert', 'events', 'fsm-base' ]
}
