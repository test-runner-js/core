'use strict'
var detect = require('feature-detect-es6')

if (detect.all('class', 'arrowFunction', 'let', 'const', 'destructuring')) {
  module.exports = require('./src/lib/test-runner')
} else {
  module.exports = require('./es5/lib/test-runner')
}
