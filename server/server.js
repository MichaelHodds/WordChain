// server.js
/* eslint-disable no-console */
"use strict";

const express = require("express");
const wordChainRouter = require("./wordChainRouter");

const TextTree = require("../lib/textTree");

module.exports = (port, dictionaryPath) => {

	// Create wev server
	const app = express();

	// Set static folder for public files
	app.use(express.static("public"));

	// Set security middleware here

	// Use jade templating engine
	app.set("views", "views");
	app.set("view engine", "pug");

	// Add route for page
	app.get("/", (req, res) => {
		res.render("index.pug");
	});

	// Load text tree
	const tree = new TextTree();
	tree.initialise(dictionaryPath, (err, lineCount) => {
		if (err) {
			return console.log(err);
		}
		console.log("Populated tree from " + lineCount + " lines.");
		const usage = process.memoryUsage();
		// Shift bytes used to something a bit more readable
		const memUsed = usage.rss >> 20;
		console.log("Using around " + memUsed + "MiB");

		// Add word chain routes
		app.use("/wordchain", wordChainRouter(tree));

		// Start server on port
		const server = app.listen(port, () => {
			const host = server.address().address;
			console.log("Server listening at http://" + host + port);
		});

	});

};
