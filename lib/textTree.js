// textTree.js
"use strict";

var fs = require("fs");
var path = require("path");
var readline = require("readline");
var zlib = require("zlib");

module.exports = (function() {

	function TextTree() {
		this.tree = null;
	}

	//// terminator
	// Character to insert in tree where a word ends
	TextTree.terminator = "\n";

	//// initialise
	// Load a given "dictionary" file into the text tree
	// Will also reset a populated text tree
	TextTree.prototype.initialise = function(filePath, callback) {
		var self = this;
		// Reset any existing text tree
		this.tree = {};
		// Attempt to access given file
		fs.open(filePath, "r", function(err, fd) {
			if (err) {
				return callback(err);
			}
			let lineCount = 0;
			let readStream = fs.createReadStream(null, { "fd": fd });
			let lineStream = null;
			// Validate dictionary format and apply transform if required
			switch (path.extname(filePath)) {
				case ".txt": {
					lineStream = readStream;
					break;
				}
				case ".gz": {
					lineStream = readStream.pipe(zlib.createUnzip());
					break;
				}
				default: {
					callback(new Error("Unsupported dictionary format"));
					return;
				}
			}
			// Read "dictionary" lines
			readline.createInterface({
				"input": lineStream
			})
			.on("line", function(line) {
				self.pushWord(line);
				++lineCount;
				return;
			})
			.on("error", function(err) {
				return callback(err);
			})
			.on("close", function() {
				return callback(null, lineCount);
			});
		});
	};

	//// pushWord
	// Add a given word to the text tree
	TextTree.prototype.pushWord = function(word) {
		// Add word to tree in case-insensitive manner
		let inWord = word.toLowerCase();
		// Start at tree root
		var treeLevel = this.tree;
		// Add each letter of the word to the text tree
		for (let i = 0, len = inWord.length; i < len; ++i) {
			let letter = inWord[i];
			// Add tree branch for letters not yet added
			if (!treeLevel.hasOwnProperty(letter)) {
				treeLevel[letter] = {};
			}
			// Traverse up to next branch
			treeLevel = treeLevel[letter];
		}
		// Add word terminator to branch
		treeLevel[TextTree.terminator] = true;
		return;
	};

	//// getPath
	// Get an array of text tree levels that create the given word
	// Each tree level (if found) contains the character of the word
	// and the final tree level (if found) contains the "terminator" character
	TextTree.prototype.getPath = function(word) {
		// Start at tree root
		var treeLevel = this.tree;
		var path = [ treeLevel ];
		// Traverse for each letter
		for (let i = 0, len = word.length; i < len; ++i) {
			let letter = word[i];
			// Attempt to traverse up to next branch
			if (treeLevel.hasOwnProperty(letter)) {
				treeLevel = treeLevel[letter];
			} else {
				return null;
			}
			// Add tree level to path
			path.push(treeLevel);
		}
		return path;
	};

	//// hasWord
	// Test a given whole word is present in text tree
	TextTree.prototype.hasWord = function(word) {
		let path = this.getPath(word);
		return(
			// Confirm path was obtained
			Array.isArray(path) &&
			// ...and it ends with word terminator
			path.pop().hasOwnProperty(TextTree.terminator)
		);
	};

	// //// hasWord
	// // Slightly faster, bloated implementation
	// TextTree.prototype.hasWord = function(word) {
	// 	// Start at tree root
	// 	var treeLevel = this.tree;
	// 	// Traverse for each letter
	// 	for (let i = 0, len = word.length; i < len; ++i) {
	// 		let letter = word[i];
	// 		// Attempt to traverse up to next branch
	// 		if (treeLevel.hasOwnProperty(letter)) {
	// 			treeLevel = treeLevel[letter];
	// 		} else {
	// 			return false;
	// 		}
	// 	}
	// 	// Ensure final tree level has word terminator
	// 	return treeLevel.hasOwnProperty(TextTree.terminator);
	// };

	return TextTree;

})();
