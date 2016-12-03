#!/usr/bin/env node

'use strict';

var tool = require('command-line-tool');
var cliData = require('../lib/cli-data');
var path = require('path');

var _tool$getCli = tool.getCli(cliData.definitions, cliData.usageSections),
    options = _tool$getCli.options,
    usage = _tool$getCli.usage;

if (options.help) tool.stop(usage);

if (options.files && options.files.length) {
  options.files.forEach(function (file) {
    return require(path.resolve(process.cwd(), file));
  });
}