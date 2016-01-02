// server.js
/* jshint node: true */
"use strict";

var express = require("express");
var wordChainRouter = require("./wordChainRouter");

var textTree = require("../lib/textTree");

module.exports = function(port, dictionaryPath) {

	// Create wev server
	var app = express();

	// Set static folder for public files
	app.use(express.static("public"));

	// Set security middleware here

	// Use jade templating engine
	app.set("views", "views");
	app.set("view engine", "jade");

	// Add route for page
	app.get('/', function (req, res) {
		res.render("index.jade");
	});

	// Load text tree
	var tree = new textTree();
	tree.initialise(dictionaryPath, function (err, lineCount) {
		if (err) {
			return console.log(err);
		}
		console.log("Populated tree from " + lineCount + " lines.");
		var usage = process.memoryUsage();
		// Shift bytes used to something a bit more readable
		var memUsed = usage.rss >> 20;
		console.log("Using around " + memUsed + "MiB");

		// Add word chain routes
		app.use("/wordchain", wordChainRouter(tree));

		// Start server on port
		var server = app.listen(port, function() {
			var host = server.address().address;
			var port = server.address().port;
			console.log("Server listening at http://" + host + port);
		});

	});

};
