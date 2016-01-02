var gulp = require("gulp");

var istanbul = require("gulp-istanbul");
var jshint = require("gulp-jshint");
var mocha = require("gulp-mocha");

gulp.task("default", function() {
	return gulp.watch("./{lib,server,public/js}/*.js", [ "lint" ])
	.on('change', function(event) {
		console.log("File " + event.path + " was " + event.type);
	});
});

gulp.task("lint", function() {
	return gulp.src("./{lib,server,public/js}/*.js")
		.pipe(jshint())
		.pipe(jshint.reporter("default"));
});

gulp.task("test", function() {
	return gulp.src("./test/*.js", { read: false })
		.pipe(mocha());
});

gulp.task("pre-coverage", function () {
	return gulp.src("./lib/*.js")
		.pipe(istanbul({
			"includeUntested": true
		}))
		.pipe(istanbul.hookRequire());
});

gulp.task("coverage", [ "pre-coverage" ], function () {
	return gulp.src("./test/*.js")
		.pipe(mocha({
			"reporter": "progress"
		}))
		.pipe(istanbul.writeReports({
			"reporters": [ "html" ]
		}));
});
