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
			callback(true);
		}
	}

	// Create viewmodel for word chain solver
	var chainViewModel = {
		"loading": ko.observable(false),
		"wordChain": ko.observableArray(),
		"fromWord": ko.observable().extend({
			rateLimit: { timeout: 500, method: "notifyWhenChangesStop" }
		}),
		"fromValid": ko.observable(true),
		"toWord": ko.observable().extend({
			rateLimit: { timeout: 500, method: "notifyWhenChangesStop" }
		}),
		"toValid": ko.observable(true)
	};

	// Validate "from" word
	chainViewModel.fromWord.subscribe(function(newValue) {
		validateWord(newValue, chainViewModel.fromValid);
	});
	// Determine class based on "from" validation
	chainViewModel.fromClass = ko.pureComputed(function() {
		return this.fromWord() ? this.fromValid() ? "label-success" : "label-danger" : "";
	}, chainViewModel);

	// Validate "to" word
	chainViewModel.toWord.subscribe(function(newValue) {
		validateWord(newValue, chainViewModel.toValid);
	});
	// Determine class based on "to" validation
	chainViewModel.toClass = ko.pureComputed(function() {
		return this.toWord() ? this.toValid() ? "label-success" : "label-danger" : "";
	}, chainViewModel);

	// Bind viewmodel to wordchain solver
	ko.applyBindings(chainViewModel, document.getElementById("wordChain"));

	// Override form submission handler
	var chainForm = $(document.getElementById("chainForm"));
	chainForm.on("submit", function(event) {
		event.preventDefault();
		getChain($(this).serialize());
	});

});
