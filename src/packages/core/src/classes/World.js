define([
	'tiny-emitter',
	'object-store'
], function(
	EventEmitter,
	ObjectStore
) {

	function World(app, canvasElement) {
		EventEmitter.call(this);

		this.Tile = app.Tile;

		this.tiles = new ObjectStore({
			requireInstanceOf: this.Tile,
			primaryKey: 'id'
		});

		// Function to get tiles in an order so that most-towards-camera comes last
		this.tiles.listFromTopToBottom = function () {
			return this.list().sort(function(a, b) {
				if(a.y === b.y)
					return a.x < b.x ? -1 : 1;
				return a.y < b.y ? 1 : -1;
			});
		};
		
		this.tiles.listWithinManhattanDistance = function (center, distance) {
			var list = [];
			for(var y = center.y - distance; y <= center.y + distance; ++y) {
				for(var x = center.x - distance; x <= center.x + distance; ++x) {
					var tile = this.get(x + ',' + y);
					if(tile)
						list.push(tile);
				}
			}
			return list;
		};

		this.renderer = new app.Renderer(canvasElement, function () {
			this.renderAroundTile(app.getPlayerLocation(), 20); // @TODO: Move knwledge of app.player out of here
		}.bind(this));

		this.tiles.set(new this.Tile(0, 0));
	}


	World.prototype = Object.create(EventEmitter.prototype);
	World.prototype.constructor = World;
	/**
	 *
	 */
	World.prototype.generateNewTiles = function (saturationThresholdOverride) {
		this.tiles.list().forEach(function (tile) {
			if(tile.isSaturated(this.tiles, saturationThresholdOverride))
				return;

			//shuffle(tile.getUnfilledNeighbours(this.tiles)).forEach(function (id) {
			tile.getUnfilledNeighbours(this.tiles).forEach(function (id) {
				var coordinates = tile.getCoordinatesForId(id);
				var neighbour = new this.Tile(coordinates[0], coordinates[1]);
				this.tiles.set(neighbour);
			}.bind(this));
		}.bind(this));
	};

	/**
	 *
	 */
	World.prototype.renderAllTiles = function () {
		var renderer = this.renderer;

		this.tiles.listFromTopToBottom().forEach(function (tile) {
			tile.render(renderer);
		});
	};

	World.prototype.renderAroundTile = function (tile, distance) {
		var renderer = this.renderer;

		this.tiles.listWithinManhattanDistance(tile, distance).forEach(function (tile) {
			tile.render(renderer);
		});
	};

	/**
	 * Pan to pixel values
	 * @param {Number} x
	 * @param {Number} y
	 */
	World.prototype.panToOffset = function (x, y) {
		this.renderer.setOffset(x, y);
		//this.renderer.clear();
		//this.renderAllTiles();
	};

	/**
	 * Pan to the position of a tile
	 * @param {Number|Tile} x
	 * @param {Number} [y]
	 * @param {Number} [z]
	 */
	World.prototype.panToTile = function (x, y, z) {
		var coords = x instanceof this.Tile
			? this.renderer.pixelForCoordinates(x.x, x.y, x.z, true)
			: this.renderer.pixelForCoordinates(x, y, z || 0, true);
		this.panToOffset(
			-coords[0],
			-coords[1]
		)
	};

	/**
	 * Returns a "landing zone", aka spawn area
	 * @returns {Object}
	 */
	World.prototype.getSpawnTile = function () {
		return this.tiles.get('0,0');
	};
	

	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex ;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	return World;
});