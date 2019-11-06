module.exports = [
  {
    input: 'index.mjs',
    output: {
      file: 'dist/index.js',
      format: 'umd',
      name: 'TestRunnerCore'
    }
  },
  {
    input: 'index.mjs',
    output: {
      file: 'dist/index.mjs',
      format: 'esm'
    }
  }
]
