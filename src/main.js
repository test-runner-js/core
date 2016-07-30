'use strict'
var detect = require('feature-detect-es6')

if (detect.all('class', 'arrowFunction', 'let', 'const', 'collections', 'destructuring')) {
  module.exports = require('./lib/test-runner')
} else {
  require('core-js/es6/object')
  module.exports = require('../es5/lib/test-runner')
}
