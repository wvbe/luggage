require.config({
	'baseUrl': './',
	'paths': {
		'text':                     '../lib/requirejs-text/text',

		'app': 'app',

		// https://github.com/wvbe/object-store
		'object-store': '../lib/object-store/ObjectStore',

		// https://github.com/scottcorgan/tiny-emitter
		'tiny-emitter': '../lib/tiny-emitter/dist/tinyemitter',

		// https://github.com/brehaut/color-js/
		'Color': '../lib/color-js/color'
	},
	'packages': [

		{ name: 'core',                     location: 'packages/core/src'},
		{ name: 'ui',            location: 'packages/ui/src'},
		{ name: 'language',            location: 'packages/language/src'},

	],
	shim: {
		'Color': {
			exports: 'net.brehaut.Color'
		}
	}

});
