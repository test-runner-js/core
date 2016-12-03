#!/usr/bin/env node
'use strict'
const tool = require('command-line-tool')
const cliData = require('../lib/cli-data')
const path = require('path')

const { options, usage } = tool.getCli(cliData.definitions, cliData.usageSections)

if (options.help) tool.stop(usage)

if (options.files && options.files.length) {
  options.files.forEach(file => require(path.resolve(process.cwd(), file)))
}
