// wordChain.js

$(function() {
	"use strict";

	// Request a word chain
	function getChain(query) {
		$.getJSON("wordchain?" + query, function(data) {

			// console.log(chainViewModel.fromWord(), chainViewModel.toWord());

			console.log(data);
			if (data) {
				// Bind results to wordChain
				chainViewModel.wordChain(data);
			} else {
				chainViewModel.wordChain([ "Sorry, unable to solve" ]);
			}
		});
	};

	// Check a given word is recognised
	function validateWord(word, callback) {
		if (word) {
			$.getJSON("wordchain/validate?word=" + word, callback);
		} else {
			callback(true);
		}
	};

	var chainViewModel = {
		"wordChain": ko.observableArray(),
		"fromWord": ko.observable().extend({ rateLimit: 1000 }),
		"fromValid": ko.observable(true),
		"toWord": ko.observable().extend({ rateLimit: 1000 }),
		"toValid": ko.observable(true)
	};

	// Validate "from" word
	chainViewModel.fromWord.subscribe(function(newValue) {
		validateWord(newValue, function(valid) {
			chainViewModel.fromValid(valid);
		});
	});
	chainViewModel.fromClass = ko.pureComputed(function() {
		return this.fromWord() ? this.fromValid() ? "label-success" : "label-danger" : "";
	}, chainViewModel)

	// Validate "to" word
	chainViewModel.toWord.subscribe(function(newValue) {
		validateWord(newValue, function(valid) {
			chainViewModel.toValid(valid);
		});
	});
	chainViewModel.toClass = ko.pureComputed(function() {
		return this.toWord() ? this.toValid() ? "label-success" : "label-danger" : "";
	}, chainViewModel)


	// Bind viewmodel to wordchain solver
	ko.applyBindings(chainViewModel, document.getElementById("wordChain"));

	// Set up form for querying staff
	var chainForm = $(document.getElementById("chainForm"));
	chainForm.on("submit", function(event) {
		event.preventDefault();
		getChain($(this).serialize());
	});

});
