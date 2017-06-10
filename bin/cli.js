#!/usr/bin/env node
'use strict'
const cliData = require('../lib/cli-data')
const path = require('path')
const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')

const options = commandLineArgs(cliData.definitions)

if (options.help) {
  console.log(commandLineUsage(cliData.usageSections))
} else {
  if (options.files && options.files.length) {
    options.files.forEach(file => require(path.resolve(process.cwd(), file)))
  }
}
