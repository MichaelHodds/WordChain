// wordChainRouter.js

const express = require("express");

const wordChain = require("../lib/wordChain");

/**
 * Middleware factory for validating express request
 * @param {Array} keys expected keys in request query arguments
 * @returns {function} express middleware
 */
function reqHasKeys(keys) {
	return function (req, res, next) {
		for (let idx = 0, len = keys.length; idx < len; ++idx) {
			// Ensure key is present
			if (!req.query.hasOwnProperty(keys[idx])) {
				return res.sendStatus(400);
			}
		}
		next();
	};
}

/**
 * Provide word chain solving router for given text tree
 * @param {Object} textTree TextTree instance
 * @returns {Object} express router
 */
module.exports = (textTree) => {
	const router = new express.Router();

	// Word chain solving route
	router.get("/", reqHasKeys(["start", "end"]), (req, res) => {
		const startTS = Date.now();
		const chain = wordChain(textTree, req.query.start, req.query.end);
		res.status(200)
			.json({
				"success": Boolean(chain),
				"chain": chain,
				"timeTakenMS": Date.now() - startTS
			});
	});

	// Word validation route
	router.get("/validate", reqHasKeys(["word"]), (req, res) => {
		res.status(200)
			.send(textTree.hasWord(req.query.word));
	});

	return router;
};
