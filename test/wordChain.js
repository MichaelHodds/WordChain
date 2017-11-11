// wordChain.js
"use strict";

const should = require("should");

const TextTree = require("../lib/textTree");
const wordChain = require("../lib/wordChain");

let testTree = null;

describe("Text tree", function() {

	it("should initialise from large gzip dictionary", function(done) {
		this.timeout(0);
		testTree = new TextTree();
		should.exist(testTree);
		testTree.initialise("./dictionary.txt.gz", function(err, lineCount) {
			should.not.exist(err);
			should.exist(lineCount);
			lineCount.should.be.a.Number;
			return done();
		});
	});

});

describe("Word chain solver", function() {
	// Subject to hardware, some word chains can take a LONG time to solve
	this.timeout(0);

	it("should not create chain for invalid words", function() {
		const chain = wordChain(testTree, "xxxxx", "zzzzz");
		should.not.exist(chain);
	});

	it("should create a word chain", function() {
		const chain = wordChain(testTree, "lead", "gold");
		should.exist(chain);
		chain.should.be.an.Array();
		chain.shift().should.equal("lead");
		chain.pop().should.equal("gold");
	});

	it("should create a word chain", function() {
		const chain = wordChain(testTree, "market", "barter");
		should.exist(chain);
		chain.should.be.an.Array();
		chain.shift().should.equal("market");
		chain.pop().should.equal("barter");
	});

	it("should create a word chain", function() {
		const chain = wordChain(testTree, "carry", "sough");
		should.exist(chain);
		chain.should.be.an.Array();
		chain.shift().should.equal("carry");
		chain.pop().should.equal("sough");
	});

	it("should create a word chain", function() {
		const chain = wordChain(testTree, "bread", "table");
		should.exist(chain);
		chain.should.be.an.Array();
		chain.shift().should.equal("bread");
		chain.pop().should.equal("table");
	});

	it("should create a word chain", function() {
		const chain = wordChain(testTree, "travel", "market");
		should.exist(chain);
		chain.should.be.an.Array();
		chain.shift().should.equal("travel");
		chain.pop().should.equal("market");
	});

});
