// wordChainRouter.js
/* jshint node: true */
"use strict";

var express = require("express");

var wordChain = require("../lib/wordChain");

module.exports = function(textTree) {
	var router = express.Router();

	// Word chain solving route
	router.get("/", function(req, res) {
		var chain = wordChain(textTree, req.query.start, req.query.end);

		res.status(200)
		.send(chain);
	});

	// Word validation route
	router.get("/validate", function(req, res) {
		res.status(200)
		.send(textTree.hasWord(req.query.word));
	});

	return router;
};
