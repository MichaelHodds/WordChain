// textTree.js
/* jshint node: true */
"use strict";

var should = require("should");

var textTree = require("../lib/textTree");

var testTree = null;

describe("Text tree", function() {

	it("constructor", function() {
		testTree = new textTree();
		should.exist(testTree);
	});

	it("should initialise handling invalid file", function(done) {
		testTree.initialise("./test/nonexistant.txt", function(err, lineCount) {
			should.exist(err);
			err.should.be.an.Error();
			return done();
		});
	});

	it("should initialise from small dictionary", function(done) {
		this.timeout(0);
		testTree.initialise("./test/dictionary-test.txt", function(err, lineCount) {
			should.not.exist(err);
			should.exist(lineCount);
			lineCount.should.be.a.Number;
			return done();
		});
	});

	it("should get the tree path for a given word", function() {
		var path = testTree.getPath("aba");
		should.exist(path);
		path.should.be.an.Array()
		.and.have.length(4);
	});

	it("should validate a known word", function() {
		testTree.hasWord("aardwolf").should.be.true();
	});

	it("should invalidate an incomplete word", function() {
		testTree.hasWord("aard").should.be.false();
	});

	it("should invalidate an unknown word", function() {
		testTree.hasWord("aaaaa").should.be.false();
	});

});
