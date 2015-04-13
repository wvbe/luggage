require.config({
	'baseUrl': './',
	'paths': {
		'text':                     '../lib/requirejs-text/text',

		'app': 'app',

		// https://github.com/wvbe/object-store
		'angular': '../lib/angular/angular',
		'object-store': '../lib/object-store/ObjectStore',

		// https://github.com/scottcorgan/tiny-emitter
		'tiny-emitter': '../lib/tiny-emitter/dist/tinyemitter',

		// https://github.com/brehaut/color-js/
		'Color': '../lib/color-js/color',

		// https://github.com/dmauro/Keypress/
		'Keypress': '../lib/Keypress/keypress'
	},
	'packages': [

		{ name: 'core',                     location: 'packages/core/src'},
		{ name: 'util',            location: 'packages/util/src'},
		{ name: 'ui',            location: 'packages/ui/src'},
		{ name: 'language',            location: 'packages/language/src'}

	],
	shim: {
		'Color': {
			exports: 'net.brehaut.Color'
		},
		'angular': {
			exports: 'angular'
		}
	}

});
