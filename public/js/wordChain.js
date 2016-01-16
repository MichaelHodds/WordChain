// wordChain.js

$(function() {
	"use strict";

	// Request a word chain
	function getChain(query) {
		// Show loader
		chainViewModel.loading(true);
		// Clear current word chain, and request next chain
		chainViewModel.wordChain([]);
		$.getJSON("wordchain?" + query)
		.done(function(data, textStatus, jqXHR) {
			if (data.success) {
				chainViewModel.wordChain(data.chain);
			} else {
				chainViewModel.wordChain([ "Sorry, unable to solve" ]);
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			alert(errorThrown);
		})
		.always(function() {
			// Hide loader
			chainViewModel.loading(false);
		});
	}

	// Check a given word is in the server dictionary
	function validateWord(word, callback) {
		if (word) {
			$.get("wordchain/validate?word=" + word, callback);
		} else {
			callback(false);
		}
	}

	// Create viewmodel for word chain solver
	var chainViewModel = {
		"loading": ko.observable(false),
		"wordChain": ko.observableArray(),
		"fromWord": ko.observable().extend({
			rateLimit: { timeout: 500, method: "notifyWhenChangesStop" }
		}),
		"fromValid": ko.observable(false),
		"toWord": ko.observable().extend({
			rateLimit: { timeout: 500, method: "notifyWhenChangesStop" }
		}),
		"toValid": ko.observable(false),
	};

	// Combination of both validation states
	chainViewModel.validInputs = ko.pureComputed(function() {
		return this.fromValid() && this.toValid();
	}, chainViewModel);

	// Validate "from" word
	chainViewModel.fromWord.subscribe(function(newValue) {
		validateWord(newValue, chainViewModel.fromValid);
	});
	// Determine class based on "from" validation
	chainViewModel.fromFeedback = ko.pureComputed(function() {
		return this.fromWord() ? this.fromValid() ? "has-success" : "has-error" : "";
	}, chainViewModel);
	chainViewModel.fromClass = ko.pureComputed(function() {
		return this.fromWord() ? this.fromValid() ? "glyphicon-ok" : "glyphicon-remove" : "";
	}, chainViewModel);

	// Validate "to" word
	chainViewModel.toWord.subscribe(function(newValue) {
		validateWord(newValue, chainViewModel.toValid);
	});
	// Determine class based on "to" validation
	chainViewModel.toFeedback = ko.pureComputed(function() {
		return this.toWord() ? this.toValid() ? "has-success" : "has-error" : "";
	}, chainViewModel);
	chainViewModel.toClass = ko.pureComputed(function() {
		return this.toWord() ? this.toValid() ? "glyphicon-ok" : "glyphicon-remove" : "";
	}, chainViewModel);
	// Bind viewmodel to wordchain solver
	ko.applyBindings(chainViewModel, document.getElementById("wordChain"));

	// Override form submission handler
	$(document.getElementById("chainForm")).on("submit", function(event) {
		event.preventDefault();
		// Prevent most requests with invalid inputs
		// Fast users can still submit with an invalid word after a valid word
		if(chainViewModel.validInputs()) {
			getChain($(this).serialize());
		}
	});

});
