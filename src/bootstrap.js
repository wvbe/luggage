require.config({
	'baseUrl': './',
	'paths': {
		'text':                     '../lib/requirejs-text/text',

		'app': 'app',

		// 3rd party
		//'promise':'../lib/promise-polyfill/Promise', // Fuck you IE
		'object-store':'../lib/object-store/ObjectStore',
		//'superagent':                 '../lib/superagent/superagent',
		'tiny-emitter':                 '../lib/tiny-emitter/dist/tinyemitter'
	},
	'packages': [

		{ name: 'core',                     location: 'packages/core/src'},
		{ name: 'ui',            location: 'packages/ui/src'},
		{ name: 'language',            location: 'packages/language/src'},

	]

});
