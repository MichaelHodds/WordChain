// main.js
"use strict";

var info = require("./package.json");
var defaultConfig = info.config

// Parse command line arguments
var program = require("commander");
program
.version(info.version)
.option("-p, --port [number]", "Server Port", defaultConfig.port)
.option("-d, --dictionary [path]", "Dictionary file", defaultConfig.dictionary)
.parse(process.argv);

// Start word-chain server
require("./server/server.js")(program.port, program.dictionary);
