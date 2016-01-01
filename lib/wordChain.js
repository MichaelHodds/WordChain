// wordChain.js
/* jshint node: true */
"use strict";

//// CONSTANTS
// These two "constants" can have a profound impact on the performance and
// capability of the word chain solver, numbers are set based on the test cases

// Limiter for how far a chain should be attempted before quitting
// Set fairly low to avoid exceeding maximum call stack size
// Set fairly high to find complex word chains
var CHAIN_LIMIT = 20;
// Limiter for number of candidates to "branch" word chain building
// Set fairly low to solve word chains faster, but increase risk of failure
var CANDIDATE_LIMIT = 5;

//// exports
// buildWordChain wrapper with basic validation

//// TODO Support differing length words
//// TODO Add means to grow/shrink given word

module.exports = function(textTree, fromWord, toWord) {
	// console.log("Going from " + fromWord + " to " + toWord);

	fromWord = fromWord.toLowerCase();
	toWord = toWord.toLowerCase();

	if (
		fromWord.length === toWord.length &&
		textTree.hasWord(fromWord) &&
		textTree.hasWord(toWord)
	) {
		return buildWordChain(textTree, [ fromWord ], toWord);
	}
	return null;
};

//// buildWordChain
// Extend a given word list with words that change by a single character
// until they match the given target word
function buildWordChain(textTree, chain, targetWord) {

	// console.log("Building...\n", chain);

	var fromWord = lastElement(chain);
	// Handle complete chain case
	if (fromWord === targetWord) {
		return chain;
	}
	// Abandon attempts that have grown too long
	if (chain.length > CHAIN_LIMIT) {
		return null;
	}

	// Attempt "optimistic" transformation strategy (match a target character)
	var candidates = optimistXform(textTree, fromWord, targetWord);
	// Fall back to "brute force" strategy (change any character)
	if (!candidates.length) {
		candidates = bruteXform(textTree, fromWord, targetWord);
	}

	// console.log("Got candidates for " + fromWord + "...\n", candidates);

	//// TODO Sort candidates list by "most likely to work"... somehow

	var newWord;
	var newChain;
	// Limit candidates to try ("lucky" candidates will be used first)
	var tryEntries = Math.min(candidates.length, CANDIDATE_LIMIT);
	// Extend word chain, attempting with each candidate word
	for (var i = 0; i < tryEntries; ++i) {
		newWord = candidates[i];
		// Only add words not already in chain
		if (chain.indexOf(newWord) < 0) {
			newChain = buildWordChain(textTree, chain.concat([ newWord ]), targetWord);
			// Validate new chain is successful
			if (newChain) {
				return newChain;
			}
		}
	}

	// No more words to attempt
	return null;
}

//// optimistXform
// Attempt to switch a letter of fromWord to match the respective letter of
// toWord, while creating a new valid word
function optimistXform(textTree, fromWord, toWord) {
	var candidates = [];
	var newWord;

	var fromLetter;
	var toLetter;
	for (var i = 0, len = fromWord.length; i < len; ++i) {
		fromLetter = fromWord[i];
		toLetter = toWord[i];
		if (fromLetter !== toLetter) {
			// Attempt to transform character of word into a chain entry
			newWord = swapLetter(fromWord, i, toLetter);
			if (textTree.hasWord(newWord)) {
				candidates.push(newWord);
			}
		}
	}
	return candidates;
}

//// bruteXform
// Attempt to change a letter of fromWord into a new valid word
function bruteXform(textTree, fromWord, toWord) {
	var candidates = [];
	var newWord;

	var fromPath = textTree.getPath(fromWord);
	var fromMap;
	var fromLetter;
	var toLetter;
	var testLetter;
	// for (var i = fromWord.length; i >= 0; --i) {
	for (var i = 0, len = fromWord.length; i < len; ++i) {
		fromMap = fromPath[i];
		fromLetter = fromWord[i];
		toLetter = toWord[i];
		// Try any other neighbor character in text tree
		for (testLetter in fromMap) {
			if (testLetter !== fromLetter) {
				newWord = swapLetter(fromWord, i, testLetter);
				if (textTree.hasWord(newWord)) {
					candidates.push(newWord);
				}
			}
		}
	}
	return candidates;
}

//// growXform
// Attempt to extend word by a letter

//// shrinkXform
// Attempt to reduce word by a letter

//// lasElement
// Return the last item in an aray
function lastElement(list) {
	return list[list.length - 1];
}

//// swapLetter
// Replace character in word at given index with new letter
function swapLetter(word, idx, letter) {
	return word.substr(0, idx) + letter + word.substr(idx + 1);
}
