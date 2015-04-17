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
	function Entity(tile, options) {
		EventEmitter.call(this);

		this.options = options;

		// Entity location
		this.tile = tile;
		this.path = [];

		// Some presentation stuffs
		this.fillColor = new Color([255, 255, 255]);
		this.strokeColor = new Color([50,50,50]);
	}

	Entity.prototype = Object.create(EventEmitter.prototype);
	Entity.prototype.constructor = Entity;

	Entity.prototype.getTileRelativeToPosition = function (world, dx, dy) {
		return world.get([
			this.tile.x + dx,
			this.tile.y + dy
		]);
	};

	/**
	 * Move player by a relative number of tiles horizontally and vertically
	 * @todo Must be refactored to eat a tile instead of world, x and y
	 * @param {Tile} tile
	 */
	Entity.prototype.move = function (tile) {
		// If tile does not exist, stop
		if(!tile) {
			this.think(language.player.CANNOT_MOVE__EMPTY_TILE);
			return;
		}

		if(tile.isWater()) {
			this.think(language.player.CANNOT_MOVE__WATER);
			return;
		}

		if(!this.canMoveBetweenTiles(this.tile, tile)) {
			this.think(language.player.CANNOT_MOVE__TOO_STEEP);
			return;
		}

		// Save as new player location and pan world to it
		this.tile = tile;

		// @TODO: Move this to a callback/even
		this.emit('move', this.tile);
	};

	Entity.prototype.canMoveBetweenTiles = function (a, b) {
		return !(Math.abs(b.z - a.z) > 2);
	};

	/**
	 * An introspective monologue with oneself
	 * @param message
	 * @param isMemorable
	 */
	Entity.prototype.think = function (message) {
		this.emit('thought', message);
	};

	Entity.prototype.findPathToTile = function (world, end) {
		if(!end)
			return [];

		return new Path(world, this, this.tile, end);
	};

	Entity.prototype.walk = function (path) {
		if(!path || !path.length) {
			this.think(language.player.CANNOT_WALK__NO_PATH);
			return;
		}

		this.move(path.pop());
		var interval = setInterval(function () {
			var tile = path.pop();
			if(tile)
				this.move(tile);
			else
				clearInterval(interval);
		}.bind(this), this.options.moveInterval || 500);

		// Remember
		this.path = path;
	};
	/**
	 * Tell the provided renderer how to yield a visual representation of the player
	 * @param {Renderer} renderer
	 */
	Entity.prototype.renderEntity = function (renderer) {
		var sphereRadius = 0.15;
		renderer.fillPerfectCircle(
			this.tile.x + 0.5, // Positioned on the middle...
			this.tile.y + 0.5, // ... of the x and y of tile
			this.tile.z + sphereRadius, // Center is on same tile z + it's own radius
			sphereRadius,
			this.strokeColor,
			this.fillColor
		);

		renderer.context.lineWidth = 3;
		renderer.strokeSpatialPolygon(this.path.concat([this.tile]).map(function (tile) {
				return [tile.x + 0.5, tile.y + 0.5, tile.z];
			}),
			new Color('yellow').setAlpha(0.7)
		);
		renderer.context.lineWidth = 1;
	};

	return Entity;
});