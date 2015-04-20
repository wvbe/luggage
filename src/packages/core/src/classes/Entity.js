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
	 * @todo Must be refactored to eat a tile instead of world, x and y
	 * @param {Tile} tile
	 */
	Entity.prototype.move = function (tile) {
		if(!tile)
			return Promise.reject(new Error('CANNOT_MOVE__EMPTY_TILE'));

		if(!this.tile.isNeighbourOf(tile))
			return Promise.reject(new Error('CANNOT_MOVE__NOT_NEIGHBOUR'));

		return this._walk([tile]);
	};
	Entity.prototype._move = function (tile) {
		return new Promise(function (resolve, reject) {
			var time = this.options.moveInterval || 1000;

			if(tile.isWater())
				return reject(new Error('CANNOT_MOVE__WATER'));

			if(!this.canMoveBetweenTiles(this.tile, tile))
				throw new Error('CANNOT_MOVE__TOO_STEEP');

			this.tile = tile;
			this.moving = true;
			this.emit('move', tile);

			// @TODO: Move this to a callback/even
			setTimeout(function () {
				this.moving = false;
				resolve();
			}.bind(this), time);
		}.bind(this));
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
		if(!path || !path.length)
			return Promise.reject(new Error('CANNOT_WALK__NO_PATH')).catch(function (err) {
				this.emit('walk:error', err);
				this.stop();
			}.bind(this));

		this.emit('walk:start');

		return this._walk(path);

	};
	Entity.prototype._walk = function (path) {
		if(path)
			this.path = path;

		if(!this.path || !this.path.length) {
			this.emit('walk:end');
			return;
		}

		var nextTile = this.path.shift();

		if(!this.moving)
			this._move(nextTile).then(this._walk.bind(this)).catch(function (err) {
				this.emit('walk:error', err);
				this.stop();
			}.bind(this));
	};

	Entity.prototype.stop = function () {
		this.path = [];
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
		if(this.path && this.path.length >= 2) {
			renderer.context.lineWidth = 3;
			renderer.strokeSpatialBezier([this.tile].concat(this.path).map(function (tile) {
					return [tile.x + 0.5, tile.y + 0.5, tile.z];
				}),
				new Color('yellow').setAlpha(0.7)
			);
			renderer.context.lineWidth = 1;
		}
	};

	return Entity;
});