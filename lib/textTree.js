// textTree.js

const fileSys = require("fs");
const path = require("path");
const readline = require("readline");
const zlib = require("zlib");

// Character to insert in tree where a word ends
const terminator = "\n";

/**
 * TextTree initialisation callback
 * @callback loadCallback
 * @param {Error} err Node Error
 * @param {number} lineCount number of lines read
 */

class TextTree {

	/**
	 * @constructor
	 */
	constructor() {
		this.tree = null;
	}

	/**
	 * Load a given "dictionary" file into the text tree
	 * Will also reset a populated text tree
	 * @param {string} filePath relative path to dictionary file
	 * @param {loadCallback} callback tree loaded callback
	 * @returns {undefined}
	 */
	initialise(filePath, callback) {
		// Reset any existing text tree
		this.tree = {};
		// Attempt to access given file
		fileSys.open(filePath, "r", (err, descriptor) => {
			if (err) {
				return callback(err);
			}
			let lineCount = 0;
			const readStream = fileSys.createReadStream(null, { "fd": descriptor });
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

	/**
	 * Add a given word to the text tree
	 * @param {string} word word
	 * @returns {undefined}
	 */
	pushWord(word) {
		// Add word to tree in case-insensitive manner
		const inWord = word.toLowerCase();
		// Start at tree root
		let treeLevel = this.tree;
		// Add each letter of the word to the text tree
		for (let idx = 0, len = inWord.length; idx < len; ++idx) {
			const letter = inWord[idx];
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

	/**
	 * Each tree level (if found) contains the character of the word
	 * and the final tree level (if found) contains the "terminator" character
	 * @param {string} word word
	 * @returns {Array} List of text tree levels that create the given word
	 */
	getPath(word) {
		// Start at tree root
		let treeLevel = this.tree;
		const treePath = [treeLevel];
		// Traverse for each letter
		for (let idx = 0, len = word.length; idx < len; ++idx) {
			const letter = word[idx];
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

	/**
	 * Test a given whole word is present in text tree
	 * @param {string} word word
	 * @returns {boolean} true if word is present
	 */
	hasWord(word) {
		// Start at tree root
		let treeLevel = this.tree;
		// Traverse for each letter
		for (let idx = 0, len = word.length; idx < len; ++idx) {
			const letter = word[idx];
			// Attempt to traverse up to next branch
			if (treeLevel.hasOwnProperty(letter)) {
				treeLevel = treeLevel[letter];
			} else {
				return false;
			}
		}
		// Ensure final tree level has word terminator
		return treeLevel.hasOwnProperty(terminator);
	}
}

module.exports = TextTree;
