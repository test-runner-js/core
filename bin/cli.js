#!/usr/bin/env node
'use strict'
const path = require('path')
const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')
const TestRunner = require('../')

const options = commandLineArgs([
  { name: 'files', type: String, multiple: true, defaultOption: true },
  { name: 'help', type: Boolean, alias: 'h' }
])

if (options.help) {
  console.log(commandLineUsage([
    {
      header: 'test-runner',
      content: 'Minimal test runner.'
    },
    {
      header: 'Options',
      optionList: exports.definitions
    }
  ]))
} else {
  if (options.files && options.files.length) {
    TestRunner.run(options.files)
  }
}
