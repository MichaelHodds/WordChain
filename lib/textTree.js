// textTree.js
"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const zlib = require("zlib");

// Character to insert in tree where a word ends
const terminator = "\n";

class TextTree {

	constructor() {
		this.tree = null;
	}

	//// initialise
	// Load a given "dictionary" file into the text tree
	// Will also reset a populated text tree
	initialise(filePath, callback) {
		// Reset any existing text tree
		this.tree = {};
		// Attempt to access given file
		fs.open(filePath, "r", (err, fd) => {
			if (err) {
				return callback(err);
			}
			let lineCount = 0;
			const readStream = fs.createReadStream(null, { "fd": fd });
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
				.on("line", (line) => {
					this.pushWord(line);
					++lineCount;
					return;
				})
				.on("error", callback)
				.on("close", () => {
					callback(null, lineCount);
				});
		});
	}

	//// pushWord
	// Add a given word to the text tree
	pushWord(word) {
		// Add word to tree in case-insensitive manner
		const inWord = word.toLowerCase();
		// Start at tree root
		let treeLevel = this.tree;
		// Add each letter of the word to the text tree
		for (let i = 0, len = inWord.length; i < len; ++i) {
			const letter = inWord[i];
			// Add tree branch for letters not yet added
			if (!treeLevel.hasOwnProperty(letter)) {
				treeLevel[letter] = {};
			}
			// Traverse up to next branch
			treeLevel = treeLevel[letter];
		}
		// Add word terminator to branch
		treeLevel[terminator] = true;
		return;
	}

	//// getPath
	// Get an array of text tree levels that create the given word
	// Each tree level (if found) contains the character of the word
	// and the final tree level (if found) contains the "terminator" character
	getPath(word) {
		// Start at tree root
		let treeLevel = this.tree;
		const treePath = [treeLevel];
		// Traverse for each letter
		for (let i = 0, len = word.length; i < len; ++i) {
			const letter = word[i];
			// Attempt to traverse up to next branch
			if (treeLevel.hasOwnProperty(letter)) {
				treeLevel = treeLevel[letter];
			} else {
				return null;
			}
			// Add tree level to path
			treePath.push(treeLevel);
		}
		return treePath;
	}

	//// hasWord
	// Test a given whole word is present in text tree
	hasWord(word) {
		const treePath = this.getPath(word);
		return (
			// Confirm path was obtained
			Array.isArray(treePath) &&
			// ...and it ends with word terminator
			treePath.pop().hasOwnProperty(terminator)
		);
	}

	// //// hasWord
	// // Slightly faster, bloated implementation
	// hasWord(word) {
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
	// 	return treeLevel.hasOwnProperty(terminator);
	// }
}

module.exports = TextTree;
