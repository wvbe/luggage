define([
	'Color',
	'tiny-emitter',
	'language',
	'ui'
], function(Color, EventEmitter, language, ui) {

	var PLAYER_LANGUAGE_TOOLTIP_OPTIONS = {
		timeout: 500
	};

	function Player(app, tile) {
		EventEmitter.call(this);
		// Player location
		this.tile = tile;
		this.fillColor = new Color([255, 255, 255]);
		this.strokeColor = new Color([50,50,50]);

		this.tooltip = app.tooltip.registerSlot(
			'player',
			{ /* options */ },
			document.getElementById('tooltips')
		);
	}

	Player.prototype = Object.create(EventEmitter.prototype);
	Player.prototype.constructor = Player;

	Player.prototype.move = function (world, x, y) {
		var tile = world.tiles.get(this.tile.getIdForCoordinates(this.tile.x + x, this.tile.y + y));

		// If tile does not exist, stop
		if(!tile) {
			this.yikes(language.player.CANNOT_MOVE__EMPTY_TILE);
			return;
		}

		if(tile.isWater()) {
			this.hmm(language.player.CANNOT_MOVE__WATER);
			return;
		}


		var dz = tile.z - this.tile.z;
		if(dz > 2) {
			this.hmm(language.player.CANNOT_MOVE__TOO_STEEP_UP);
			return;
		}

		if(dz < -2) {
			this.doh(language.player.CANNOT_MOVE__TOO_STEEP_DOWN);
			return;
		}

		// Save as new player location and pan world to it
		this.tile = tile;

		// @TODO: Move this to a callback/even
		this.emit('move', this.tile);
	};

	Player.prototype.doh = function (message) {
		this.tooltip.open(new ui.RandomLanguageTooltip(message, PLAYER_LANGUAGE_TOOLTIP_OPTIONS));
	};

	Player.prototype.hmm = function (message) {
		this.tooltip.open(new ui.RandomLanguageTooltip(message, PLAYER_LANGUAGE_TOOLTIP_OPTIONS));
	};

	Player.prototype.yikes = function (message) {
		this.tooltip.open(new ui.RandomLanguageTooltip(message, PLAYER_LANGUAGE_TOOLTIP_OPTIONS3));
	};

	Player.prototype.setKeyBinds = function (world) {
		document.addEventListener('keydown', function (event) {
			// If not an arrow key, ignore
			if(event.keyCode < 37 || event.keyCode > 40)
				return;

			// Do not scroll page or whatever
			event.preventDefault();

			switch (event.keyCode) {
				case 37: // left
					return this.move(world, -1, 0);
				case 38: // up
					return this.move(world, 0, 1);
				case 39: // right
					return this.move(world, 1, 0);
				case 40: // down
					return this.move(world, 0, -1);
			}
		}.bind(this));
	};


	/**
	 *
	 * @param {Renderer} renderer
	 */
	Player.prototype.render = function (renderer) {
		var sphereRadius = 0.15;
		renderer.fillPerfectCircle(
			this.tile.x + 0.5, // Positioned on the middle...
			this.tile.y + 0.5, // ... of the x and y of tile
			this.tile.z + sphereRadius, // Center is on same tile z + it's own radius
			sphereRadius,
			this.strokeColor,
			this.fillColor
		);
	};

	return Player;
});