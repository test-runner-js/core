'use strict'
var detect = require('feature-detect-es6')

if (!Array.prototype.includes) {
  require('core-js/es7/array')
}

if (!detect.collections()) {
  require('core-js/es6/map')
}
if (!detect.promises()) {
  require('core-js/es6/promise')
}

if (detect.all('class', 'arrowFunction', 'let', 'const', 'collections', 'destructuring')) {
  module.exports = require('./lib/test-runner')
} else {
  require('core-js/es6/object')
  module.exports = require('../es5/lib/test-runner')
}
