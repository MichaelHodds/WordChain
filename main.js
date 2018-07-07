// main.js

// Parse command line arguments
const argv = require('minimist')(process.argv, {
	string: "dictionary",
	default: {
		port: 8080,
		dictionary: "./dictionary.txt.gz"
	}
});

// Start word-chain server
require("./server/server.js")(argv.port, argv.dictionary);
