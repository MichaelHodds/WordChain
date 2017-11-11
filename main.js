// main.js
"use strict";

const info = require("./package.json");

// Parse command line arguments
const program = require("commander");
program
.version(info.version)
.option("-p, --port [number]", "Server Port", 8080)
.option("-d, --dictionary [path]", "Dictionary file", "./dictionary.txt.gz")
.parse(process.argv);

// Start word-chain server
require("./server/server.js")(program.port, program.dictionary);
