const resolve = require('rollup-plugin-node-resolve')

module.exports = [
  {
    input: 'index.mjs',
    output: {
      file: 'dist/index.js',
      format: 'umd',
      name: 'TestRunnerCore'
    },
    plugins: [resolve()]
  },
  {
    input: 'index.mjs',
    output: {
      file: 'dist/index.mjs',
      format: 'esm'
    },
    plugins: [resolve()]
  }
]