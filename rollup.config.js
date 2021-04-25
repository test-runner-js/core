const resolve = require('rollup-plugin-node-resolve')

module.exports = [
  {
    input: 'index.mjs',
    output: {
      file: 'dist/index.mjs',
      format: 'esm'
    },
    // external: ['perf_hooks'],
    plugins: [resolve({
      preferBuiltins: true
    })]
  }
]
