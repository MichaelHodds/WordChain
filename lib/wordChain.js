// wordChain.js

// Limiter for how far a chain should be attempted before quitting
// Set fairly low to avoid exceeding maximum call stack size
// Set fairly high to find complex word chains
const CHAIN_LIMIT = 20;
// Limiter for number of candidates to "branch" word chain building
// Set fairly low to solve word chains faster, but increase risk of failure
const CANDIDATE_LIMIT = 5;

// TODO Support differing length words
// TODO Add means to grow/shrink given word

/**
 * buildWordChain wrapper with basic validation
 * @param {Object} textTree TextTree instance
 * @param {string} startWord first word in chain
 * @param {string} endWord target last word in chain
 * @returns {(Array|null)} Completed list of words or null
 */
module.exports = (textTree, startWord, endWord) => {
	const fromWord = startWord.toLowerCase();
	const toWord = endWord.toLowerCase();
	if (
		fromWord.length === toWord.length &&
		textTree.hasWord(fromWord) &&
		textTree.hasWord(toWord)
	) {
		return buildWordChain(textTree, [fromWord], toWord);
	}
	return null;
};

/**
 * Extend a given word list with words that change by a single character
 * until they match the given target word
 * @param {Object} textTree TextTree instance
 * @param {Array} chain assembled chain so far
 * @param {string} targetWord intended word to
 * @returns {(Array|null)} Completed list of words or null
 */
function buildWordChain(textTree, chain, targetWord) {
	const fromWord = lastElement(chain);
	// Handle complete chain case
	if (fromWord === targetWord) {
		return chain;
	}
	// Abandon attempts that have grown too long
	if (chain.length > CHAIN_LIMIT) {
		return null;
	}

	// Attempt "optimistic" transformation strategy (match a target character)
	let candidates = optimistXform(textTree, fromWord, targetWord);
	// Fall back to "brute force" strategy (change any character)
	if (!candidates.length) {
		candidates = bruteXform(textTree, fromWord, targetWord);
	}

	// Limit candidates to try ("lucky" candidates will be used first)
	const tryEntries = Math.min(candidates.length, CANDIDATE_LIMIT);
	// Extend word chain, attempting with each candidate word
	for (let idx = 0; idx < tryEntries; ++idx) {
		const newWord = candidates[idx];
		// Only add words not already in chain
		if (chain.indexOf(newWord) < 0) {
			const newChain = buildWordChain(textTree, chain.concat([newWord]), targetWord);
			// Validate new chain is successful
			if (newChain) {
				return newChain;
			}
		}
	}

	// No more words to attempt
	return null;
}

/**
 * List potential words changing a character in fromWord to one that matches in toWord
 * "Match letter transformation"
 * @param {Object} textTree TextTree instance
 * @param {string} fromWord starting word
 * @param {string} toWord target word
 * @returns {Array} list of "candidate" words
 */
function optimistXform(textTree, fromWord, toWord) {
	const candidates = [];
	for (let idx = 0, len = fromWord.length; idx < len; ++idx) {
		const fromLetter = fromWord[idx];
		const toLetter = toWord[idx];
		if (fromLetter !== toLetter) {
			// Attempt to transform character of word into a chain entry
			const newWord = swapLetter(fromWord, idx, toLetter);
			if (textTree.hasWord(newWord)) {
				candidates.push(newWord);
			}
		}
	}
	return candidates;
}

/**
 * List potential words changing a character in fromWord to one that matches in toWord
 * "Brute force transformation"
 * @param {Object} textTree TextTree instance
 * @param {string} fromWord starting word
 * @param {string} toWord target word
 * @returns {Array} list of "candidate" words
 */
function bruteXform(textTree, fromWord) {
	const candidates = [];
	const fromPath = textTree.getPath(fromWord);
	for (let idx = 0, len = fromWord.length; idx < len; ++idx) {
		const fromMap = fromPath[idx];
		const fromLetter = fromWord[idx];
		// Try any other neighbor character in text tree
		for (const testLetter in fromMap) {
			if (testLetter !== fromLetter) {
				const newWord = swapLetter(fromWord, idx, testLetter);
				if (textTree.hasWord(newWord)) {
					candidates.push(newWord);
				}
			}
		}
	}
	return candidates;
}

// TODO transform: attempt to extend word by a letter

// TODO transform: attempt to reduce word by a letter

/**
 * Return a copy of the last item in an aray
 * @param {Array} list array with at least 1 entry
 * @returns {*} copy of the last item in list
 */
function lastElement(list) {
	return list[list.length - 1];
}

/**
 * Replace letter in word at given index
 * @param {string} word source word
 * @param {number} idx letter replace index
 * @param {string} letter target letter
 * @returns {string} word with replaced letter
 */
function swapLetter(word, idx, letter) {
	return word.substr(0, idx) + letter + word.substr(idx + 1);
}
