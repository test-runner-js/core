export default {
  input: 'lib/test.mjs',
  output: {
    file: 'dist/test.js',
    format: 'cjs'
  },
  external: [ 'assert' ]
}
