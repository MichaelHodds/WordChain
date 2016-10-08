// wordChain.js

$(function() {

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
		if (word) {
			$.get("wordchain/validate?word=" + word, callback);
		} else {
			callback(false);
		}
	}

	// Word entry component, validates word is present in dictionary
	Vue.component("valid-word", {
		"template": document.getElementById("word-validator"),
		"props": [ "name", "label" ],
		"data": function() {
			return {
				"id": "input-" + Math.random(),
				"word": "",
				"valid": false,
				"validated": false,
				"timerId": null
			};
		},
		"computed": {
			"feedbackState": function() {
				return this.validated ? (this.valid ? "has-success" : "has-error") : "";
			},
			"feedbackIcon": function() {
				return this.validated ? (this.valid ? "glyphicon-ok" : "glyphicon-remove") : "";
			}
		},
		"methods": {
			"onInput": function(event) {
				// Any changes must be validated first
				this.$emit("validated", false);
				this.validated = false;
				// "Debounce" word validation
				clearTimeout(this.timerId);
				this.timerId = setTimeout(this.validateWord, 400);
			},
			"validateWord": function() {
				var self = this;
				validateWord(self.word, function(valid) {
					self.validated = true;
					self.valid = valid;
					self.$emit("validated", valid);
				});
			}
		}
	});

	// Word chain solver viewmodel
	var chainViewModel = new Vue({
		"el": document.getElementById("wordChain"),
		"data": {
			"loading": false,
			"wordChain": [],
			"startValid": false,
			"endValid": false
		},
		"computed": {
			"wordsValid": function() {
				return this.startValid && this.endValid;
			}
		},
		"methods": {
			"setStartValid": function(valid) {
				this.startValid = valid;
			},
			"setEndValid": function(valid) {
				this.endValid = valid;
			},
			"submit": function(event) {
				var self = this;
				self.wordChain = [];
				self.loading = true;
				getChain($(event.target).serialize(), function(err, chain) {
					self.loading = false;
					if (err) {
						alert(err);
					} else {
						self.wordChain = chain;
					}
				});
			}
		}
	});

});
