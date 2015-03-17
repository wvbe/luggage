define([
	'Color'
], function (Color) {
	return {
		initial: {
			// Distance of furthest possible tile in the initial map
			radius: 25,

			// Initial shape of the map: circle|square|manhattan|grow
			type: 'square',

			// Amount of generator iterations before locking tiles
			iterations: 6,
			iterationsDeviance: 2 // may differ for individual tiles, to give the landscape a quirkier look - must be smaller than half of iterations
		},

		player: {
			// Move speed
			speed: 250,

			// Language/thought balloons
			language: {
				timeout: 500 * 1000 // ms
			}
		},
		tooltip: {
			timeout: 500 * 1000 // ms
		},
		theme: {
			// Used to base grass on, and other colors
			base: new Color('#1b1b1b'),

			waterFill: false,
			waterStroke: new Color('#444349').darkenByRatio(0.3).setAlpha(0.3),

			beachFill: new Color('#CBCC90'),
			beachStroke: new Color('#CBCC90').darkenByRatio(0.3),

			grassFill: new Color('#3F8F42'),
			grassStroke: new Color('#000'),

			barrenFill: new Color('#444'),
			barrenStroke: new Color('#444').darkenByRatio(0.3)
		},
		renderer: {
			// General rendering method: halo | cube
			type: 'halo',

			// Fill shapes?
			drawFills: true,

			// Stroke shapes?
			drawStrokes: true,

			roundZ: false
		},
		perspective: {
			tileSize: 32,
			tileHeight: 5,
			angle: 30
		}
	}
});