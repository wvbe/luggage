define([
	'tiny-emitter',
	'object-store'
], function(
	EventEmitter,
	ObjectStore
) {

	function World(app) {
		EventEmitter.call(this);

		this.Tile = app.Tile;

		this.tiles = new ObjectStore({
			requireInstanceOf: this.Tile,
			primaryKey: 'id'
		});

		this.tiles.set(new this.Tile(0, 0, Math.random()));
	}


	World.prototype = Object.create(EventEmitter.prototype);
	World.prototype.constructor = World;

	// @TODO: The delta X & Y's (and their render order) can be cached for every distance.
	World.prototype.getAreaAroundPosition = function (center, distance) {
		var list = [],
			store = this.tiles;

		// Get only tiles within manhattan distance
		for(var y = center.y - distance; y <= center.y + distance; ++y) {
			for(var x = center.x - distance; x <= center.x + distance; ++x) {
				var tile = store.get(x + ',' + y);
				if(tile)
					list.push(tile);
			}
		}

		// Filter to pythagoran distance
		return list.filter(function (tile) {
			return Math.floor(pythagoras(tile.x - center.x, tile.y - center.y)) <= distance;
		});
	};

	function pythagoras (x, y) {
		return Math.sqrt(x*x + y*y);
	}
	/**
	 *
	 */
	var built = 1;
	World.prototype.generateNewTiles = function (saturationThresholdOverride) {
		this.tiles.list().forEach(function (tile) {
			if(tile.isSaturated(this.tiles, saturationThresholdOverride))
				return;

			//shuffle(tile.getUnfilledNeighbours(this.tiles)).forEach(function (id) {
			tile.getUnfilledNeighbours(this.tiles).forEach(function (id) {
				var coordinates = tile.getCoordinatesForId(id);
				var neighbour = new this.Tile(coordinates[0], coordinates[1],
					Math.abs(4 * Math.cos(built/100))
				);
				this.tiles.set(neighbour);
				++built;
			}.bind(this));
		}.bind(this));
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