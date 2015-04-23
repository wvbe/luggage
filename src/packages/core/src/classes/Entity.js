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

		this.health = 100;
		this.armor = 100;

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
		return !(Math.abs(b.z - a.z) > 2) && !b.isWater();
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

		return new Path(world, this.tile, end, this.canMoveBetweenTiles.bind(this));
	};

	Entity.prototype.walkToTile = function (world, tile, whenDone) {
		return this.walk(this.findPathToTile(world, tile), whenDone);
	};

	Entity.prototype.walk = function (path, whenDone) {
		if(!path || !path.length)
			return Promise.reject(new Error('CANNOT_WALK__NO_PATH')).catch(function (err) {
				this.emit('move:error', err);
				this.stop();
			}.bind(this));

		this._whenWalkDone = typeof whenDone === 'function' ? whenDone : null;

		if(this.moving) {
			this.path = path;
			return;
		}

		this.emit('walk:start');

		return this._walk(path, whenDone);
	};

	Entity.prototype._walk = function (path) {
		if(path)
			this.path = path;

		if(!this.path || !this.path.length) {
			this.emit('move:finish');
			if(typeof this._whenWalkDone === 'function')
				this._whenWalkDone();
			return;
		}

		var nextTile = this.path.shift();

		if(!this.moving)
			this._move(nextTile).then(this._walk.bind(this)).catch(function (err) {
				this.emit('move:error', err);
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
	Entity.prototype.render = function (renderer) {
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

	return Entity;
});