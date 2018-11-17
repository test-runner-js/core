export default {
  input: 'test/web/module/index.js',
  output: {
    file: 'dist/test/web/index.js',
    format: 'cjs'
  },
  external: [ 'assert', 'events' ]
}
