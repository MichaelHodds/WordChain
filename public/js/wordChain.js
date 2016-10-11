// wordChain.js

document.addEventListener("DOMContentLoaded", function() {

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
			"onInput": function() {
				// Any changes must be validated first
				this.$emit("validated", false);
				this.validated = false;
				// "Debounce" word validation
				clearTimeout(this.timerId);
				this.timerId = setTimeout(this.validateWord, 400);
			},
			"validateWord": function() {
				var self = this;
				// Request word validation
				fetch("wordchain/validate?word=" + self.word)
				.then( function(response) {
					return response.json();
				}).then( function(valid) {
					self.validated = true;
					self.valid = valid;
					self.$emit("validated", valid);
				}).catch( function(ex) {
					alert(ex);
				});
			}
		}
	});

	// Word chain solver viewmodel
	new Vue({
		"el": document.getElementById("wordChain"),
		"data": {
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
				self.wordChain = [ "Working..." ];
				// "Serialise" form (formatted for GET request)
				var formData = new FormData(event.target);
				var keyValList = [];
				for(var pair of formData.entries()) {
					keyValList.push(pair[0]+ "=" + pair[1])
				}
				// Request a word chain
				fetch("wordchain?" + keyValList.join("&"))
				.then( function(response) {
					return response.json();
				}).then(function(json) {
					if (json.success) {
						self.wordChain = json.chain;
					} else {
						self.wordChain = [ "Unable to solve" ];
					}
				}).catch( function(ex) {
					alert(ex);
				});
			}
		}
	});

});
