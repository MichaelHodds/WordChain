// wordChainRouter.js
"use strict";

var express = require("express");

var wordChain = require("../lib/wordChain");

//// reqHasKeys
// Middleware for ensuring a given array of keys are present in a request query
function reqHasKeys(keys) {
	return function(req, res, next) {
		for (let i = 0, len = keys.length; i < len; ++i) {
			// Ensure key is present
			if (!req.query.hasOwnProperty(keys[i])) {
				return res.status(400).send("Bad Request");
			}
		}
		next();
	};
}

//// exports
// Return word chain solving router for given text tree
module.exports = function(textTree) {
	var router = express.Router();

	// Word chain solving route
	router.get("/", reqHasKeys([ "start", "end" ]), function(req, res) {
		var startTS = Date.now();
		var chain = wordChain(textTree, req.query.start, req.query.end);
		res.status(200)
		.json({
			"success": !!chain,
			"chain": chain,
			"timeTakenMS": Date.now() - startTS
		});
	});

	// Word validation route
	router.get("/validate", reqHasKeys([ "word" ]), function(req, res) {
		res.status(200)
		.send(textTree.hasWord(req.query.word));
	});

	return router;
};
