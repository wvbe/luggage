var http = require('http'),
	path = require('path'),
	gulp = require('gulp'),
	os = require('os'),
	fs = require('fs'),

	jade = require('gulp-jade'),
	sass = require('node-sass'),
	htmlreplace = require('gulp-html-replace'),
	rjs = require('gulp-requirejs'),
	uglify = require('gulp-uglify'),


	autoprefixer = require('autoprefixer'),
	CleanCss = require('clean-css'),

	config = {
		root: __dirname,
		src: 'src',
		lib: 'lib',
		dist: 'dist',

		minify: false,
		mangle: false,

		autoprefixer: {
			browsers: [
				"last 1 version",
				"> 1%",
				"ie 8",
				"ie 7"
			]
		}
	},
	BR = os.EOL;


gulp.task('default', ['build']);

gulp.task('build', ['build-js', 'build-scss', 'build-jade', 'build-statics']);

gulp.task('build-statics', buildStaticsFactory([
	'**/*.js',
	'**/*.jade',
	'**/*.scss',
	'**/*.sass',
	'**/*.coffee',
	'**/*.xcf',
	'**/*.psd',
	'package.json',
	'bower.json'
]));
gulp.task('build-jade', buildJadeFactory([
	"./src/*.jade"
]));
gulp.task('build-js', buildJavascriptFactory(['bootstrap', 'app']));
gulp.task('build-scss', buildScssFactory('style'));

gulp.task('build-bubble', buildJavascriptFactory(['../lib/bubble/src/main'], 'bubble.js'));

function buildStaticsFactory(excluded) {
	return function() {
		var pathPrefix = path.join('.', config.src);
		return gulp.src([path.join(pathPrefix, '**', '*')].concat(excluded.map(function(exclude) {
			return '!'+path.join(pathPrefix, exclude);
		})), {})
			.pipe(gulp.dest(path.join(config.dist)));
	}
}

function buildScssFactory(filename) {
	/**
	* Compile SASS files into CSS
	* - Will minify if config.minify option is set to truthy
	* @param config
	* @returns {Function}
	*/
	return function (cb) {
		var exists = fs.existsSync(path.join(config.root, config.dist));

		if (!exists) {
			fs.mkdirSync(path.join(config.root, config.dist));
		}

		var css = autoprefixer(config.autoprefixer).process(
				sass.renderSync({
				file: path.join(config.root, config.src, filename), //where the sass files are,
				includePaths: [path.join(config.root, config.src)], //where the sass files are
				debug: true, // obvious
				outputStyle: 'nested'
			})
		).css;

		if(config.minify) {
			css = new CleanCss({
				keepSpecialComments: 0
			}).minify(css);

			if(css.errors.length || css.warnings.length)
				return cb(css.errors[0] || css.warnings[0]);

			css = css.styles;
		}



		fs.writeFile(path.join(config.root, config.dist, filename + '.css'), css, {
			encoding: 'utf8',
			flag: 'w'
		}, function(err) {
			cb(err);
		});
	}
}

function buildJadeFactory(pattern) {
	return function () {
		gulp.src(pattern)

			// Options: http://jade-lang.com/api/
			.pipe(jade({
				basedir: path.join(config.root, config.src),
				pretty: !config.minify
			}))
			.pipe(htmlreplace({
				js: 'main.js',
				css: 'style.css',
				built: '// built ' + new Date()
			}))
			.pipe(gulp.dest(config.dist));
	}
}

function buildJavascriptFactory(filenames, outOverride) {
	return function () {

		// options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
		var rjsConfig = {
				baseUrl: path.join(config.root, config.src),
				include: filenames,
				mainConfigFile: path.join(config.root, config.src, 'bootstrap.js'),
				name: path.join('..', config.lib, 'requirejs/require'),
				out: outOverride || 'main.js',
				paths: {

				},
				useStrict: true,
				wrap: true
			},
			stream = rjs(rjsConfig);

		if (config.minify) {
			stream = stream
				// options: https://github.com/terinjokes/gulp-uglify/
				.pipe(uglify({
					mangle: config.mangle
				}));
		}

		return stream.pipe(gulp.dest(config.dist));
	}
}