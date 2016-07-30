exports.definitions = [
  { name: 'files', type: String, multiple: true, defaultOption: true },
  { name: 'help', type: Boolean, alias: 'h' }
]

exports.usageSections = [
  {
    header: 'test-runner',
    content: 'Minimal test runner.'
  },
  {
    header: 'Options',
    optionList: exports.definitions
  }
]
