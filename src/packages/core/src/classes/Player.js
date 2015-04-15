define([
	'Color',
	'tiny-emitter',
	'language',
	'ui'
], function(Color, EventEmitter, language, ui) {


	function Player(tile) {
		EventEmitter.call(this);

		// Player location
		this.tile = tile;
		this.fillColor = new Color([255, 255, 255]);
		this.strokeColor = new Color([50,50,50]);
	}

	Player.prototype = Object.create(EventEmitter.prototype);
	Player.prototype.constructor = Player;

	// Must be refactored to eat a tile instead of world, x and y
	Player.prototype.move = function (world, dx, dy) {
		var tile = world.get([this.tile.x + dx, this.tile.y + dy]);

		// If tile does not exist, stop
		if(!tile) {
			this.think(language.player.CANNOT_MOVE__EMPTY_TILE);
			return;
		}

		if(tile.isWater()) {
			this.think(language.player.CANNOT_MOVE__WATER);
			return;
		}


		var dz = tile.z - this.tile.z;
		if(dz > 2) {
			this.think(language.player.CANNOT_MOVE__TOO_STEEP_UP);
			return;
		}

		if(dz < -2) {
			this.think(language.player.CANNOT_MOVE__TOO_STEEP_DOWN);
			return;
		}

		// Save as new player location and pan world to it
		this.tile = tile;

		// @TODO: Move this to a callback/even
		this.emit('move', this.tile);
	};

	/**
	 * An introspective monologue with oneself
	 * @param message
	 * @param isMemorable
	 */
	Player.prototype.think = function (message) {
		this.emit('thought', message);
	};

	/**
	 *
	 * @param {Renderer} renderer
	 */
	Player.prototype.renderCharacter = function (renderer) {
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