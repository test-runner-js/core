'use strict'
var detect = require('feature-detect-es6')

if (detect.all('arrowFunction', 'let', 'const')) {
  require('./src/test/test')
  require('./src/test/sequential')
} else {
  require('./es5/test/test')
  require('./es5/test/sequential')
}
