define([
	'Color',
	'tiny-emitter',
	'language',

	'./Path'
], function(Color, EventEmitter, language, Path) {

	/**
	 * The character our gamer has control over. While the animations may be missing, the player can move through the
	 * world already.
	 * @param tile
	 * @constructor
	 */
	function Player(tile) {
		EventEmitter.call(this);

		// Player location
		this.tile = tile;

		// Some presentation stuffs
		this.fillColor = new Color([255, 255, 255]);
		this.strokeColor = new Color([50,50,50]);
	}

	Player.prototype = Object.create(EventEmitter.prototype);
	Player.prototype.constructor = Player;

	Player.prototype.getTileRelativeToPosition = function (world, dx, dy) {
		return world.get([
			this.tile.x + dx,
			this.tile.y + dy
		]);
	}
	/**
	 * Move player by a relative number of tiles horizontally and vertically
	 * @todo Must be refactored to eat a tile instead of world, x and y
	 * @param world
	 * @param dx
	 * @param dy
	 */
	Player.prototype.move = function (world, dx, dy) {
		var tile = (world.x !== undefined && world.y !== undefined)
			? world
			: this.getTileRelativeToPosition(world, dx, dy);

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

	Player.prototype.findPathToTile = function (world, dx, dy) {

		var end = this.getTileRelativeToPosition(world, dx, dy),
			path = new Path(world, this.tile, end);

		if(!path.length)
			this.think('Couldn\'t find a decent path!');

		var interval = setInterval(function () {
			var tile = path.pop();
			if(tile)
				this.move(tile);
			else
				clearInterval(interval);

		}.bind(this), 500);
	};

	/**
	 * Tell the provided renderer how to yield a visual representation of the player
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