// wordChain.js

$(function() {
	"use strict";

	// Request a word chain
	function getChain(query, callback) {
		$.getJSON("wordchain?" + query)
		.then(function(data, textStatus, jqXHR) {
			callback(null, data.success ? data.chain : [ "Unable to solve" ]);
		}, function(jqXHR, textStatus, errorThrown) {
			callback(errorThrown);
		});
	}

	// Check a given word is in the server dictionary
	function validateWord(word, callback) {
		$.get("wordchain/validate?word=" + word, callback);
	}

	// Word entry component, validates word is present in dictionary
	Vue.component("valid-word", {
		"template": document.getElementById("word-validator"),
		"props": [ "name", "label", "field" ],
		"data": function() {
			return {
				"valid": null
			};
		},
		"computed": {
			"feedbackState": function() {
				if (this.valid === null) {
					return "";
				} else {
					return this.valid ? "has-success" : "has-error";
				}
			},
			"feedbackIcon": function() {
				if (this.valid === null) {
					return "";
				} else {
					return this.valid ? "glyphicon-ok" : "glyphicon-remove";
				}
			}
		},
		"watch": {
			// Validate input word and notify parent
			"word": function(newValue) {
				if (newValue) {
					self = this;
					validateWord(newValue, function(valid) {
						self.valid = valid;
						self.$dispatch("validation", self.name, valid);
					});
				} else {
					this.valid = null;
					this.$dispatch("validation", self.name, false);
				}
				
			}
		}
	});

	// Word chain solver viewmodel
	var chainViewModel = new Vue({
		"el": document.getElementById("wordChain"),
		"data": {
			"loading": false,
			"wordChain": [],
			"startWord": "",
			"startValid": false,
			"endWord": "",
			"endValid": false
		},
		"computed": {
			"validInputs": function() {
				return this.startValid && this.endValid;
			}
		},
		"events": {
			// Bind element validation from "valid-word" component
			"validation": function(element, state) {
				this[element + "Valid"] = state;
			}
		}
	});

	// Override form submission handler
	$(document.getElementById("chainForm")).submit(function(event) {
		event.preventDefault();
		// Show loader
		chainViewModel.loading = true;
		// Update word chain
		chainViewModel.wordChain = [];
		getChain($(event.target).serialize(), function(err, chain) {
			// Hide loader
			chainViewModel.loading = false;
			if (err) {
				alert(err);
			} else {
				chainViewModel.wordChain = chain;
			}
		});
	});

});
