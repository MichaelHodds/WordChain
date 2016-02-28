// wordChain.js

$(function() {
	"use strict";

	// Request a word chain
	function getChain(query, callback) {
		$.getJSON("wordchain?" + query)
		.then(function(data, textStatus, jqXHR) {
			if (data.success) {
				callback(null, data.chain);
			} else {
				callback(null, "Unable to solve");
			}
		}, function(jqXHR, textStatus, errorThrown) {
			callback(errorThrown);
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
			"wordValid": function() {
				if (this.field) {
					self = this;
					validateWord(this.field, function(valid) {
						self.valid = valid;
						// Notify parent state of given element
						self.$dispatch("validation", self._props.field.parentPath, valid);
					});
				} else {
					self.$dispatch("validation", self.name, false);
					this.valid = null;
				}
			},
			"feedbackState": function() {
				if (this.valid == null) {
					return "";
				} else {
					return this.valid ? "has-success" : "has-error";
				}
			},
			"feedbackIcon": function() {
				if (this.valid == null) {
					return "";
				} else {
					return this.valid ? "glyphicon-ok" : "glyphicon-remove";
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
			"fromWord": "",
			"fromWordValid": false,
			"toWord": "",
			"toWordValid": false
		},
		"computed": {
			"validInputs": function() {
				return this.fromWordValid && this.toWordValid;
			}
		},
		"events": {
			// Forward element validation from "valid-word" component
			"validation": function(element, state) {
				this[element + "Valid"] = state;
			}
		}
	});

	// Override form submission handler
	$(document.getElementById("chainForm")).on("submit", function(event) {
		event.preventDefault();
		// Show loader
		chainViewModel.loading = true;
		// Update word chain
		chainViewModel.wordChain = []
		getChain($(this).serialize(), function(err, chain) {
			// Hide loader
			chainViewModel.loading = false;
			if(err) {
				return alert(err);
			}
			chainViewModel.wordChain = chain;
		});
	});

});
