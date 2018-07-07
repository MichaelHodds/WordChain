// textTree.js

const should = require("should");

const TextTree = require("../lib/textTree");

let testTree = null;

describe("Text tree", function() {

	it("constructor", function() {
		testTree = new TextTree();
		should.exist(testTree);
	});

	it("initialise handling missing dictionary file", function(done) {
		testTree.initialise("./test/nonexistant.txt", function(err, lineCount) {
			should.exist(err);
			should.not.exist(lineCount);
			err.should.be.an.Error();
			done();
		});
	});

	it("initialise handling invalid dictionary file", function(done) {
		testTree.initialise("./package.json", function(err, lineCount) {
			should.exist(err);
			should.not.exist(lineCount);
			err.should.be.an.Error();
			done();
		});
	});

	it("initialise from small text dictionary", function(done) {
		this.timeout(0);
		testTree.initialise("./test/dictionary-test.txt", function(err, lineCount) {
			should.not.exist(err);
			should.exist(lineCount);
			lineCount.should.be.a.Number;
			done();
		});
	});

	it("get the tree path for a valid word", function() {
		const path = testTree.getPath("aba");
		should.exist(path);
		path.should.be.an.Array()
		.and.have.length(4);
	});

	it("get null for an invalid word", function() {
		const path = testTree.getPath("abc");
		should.not.exist(path);
	});

	it("validate a known word", function() {
		testTree.hasWord("aardwolf").should.be.true();
	});

	it("invalidate an incomplete word", function() {
		testTree.hasWord("aard").should.be.false();
	});

	it("invalidate an unknown word", function() {
		testTree.hasWord("aaaaa").should.be.false();
	});

});
