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
	World.prototype.generateNewTiles = function (saturationThresholdOverride) {
		var tiles = this.tiles.list();
		if(!tiles.length)
			this.generateNewTile([0, 0]);
		tiles.forEach(function (tile) {
			if(tile.isSaturated(this.tiles, saturationThresholdOverride))
				return;

			shuffle(tile.getUnfilledNeighbours(this.tiles)).forEach(function (id) {
			//tile.getUnfilledNeighbours(this.tiles).forEach(function (id) {
				var coordinates = tile.getCoordinatesForId(id);
				this.generateNewTile(coordinates);
			}.bind(this));
		}.bind(this));
	};

	World.prototype.relaxTiles = function (registry, amount) {
		if(!amount)
			amount = 0.2;
		var tiles = this.tiles.list(),
			iamount = 1 - amount;
		tiles.forEach(function (tile) {
			tile.getAllNeighbours(registry).forEach(function (otherTile) {
				if(otherTile) {
					var highestZ = otherTile ? (tile.z > otherTile.z ? tile.z : otherTile.z) : tile.z;
					otherTile.z = iamount * otherTile.z + amount * highestZ;
					tile.z = amount * highestZ + iamount * tile.z;
				} else {
					tile.z = iamount * iamount * iamount * tile.z;
				}
			});
		});
	};

	var built = 1;
	World.prototype.generateNewTile = function (coordinates) {
		var manhattanDistanceFromCenter = Math.abs(coordinates[0]) + Math.abs(coordinates[1]);
		this.tiles.set(new this.Tile(
			coordinates[0],
			coordinates[1],
			Math.pow((3
				- Math.sin(0.004 * Math.cos(1/(manhattanDistanceFromCenter || 0.001)) * manhattanDistanceFromCenter)
				+ Math.sin(1.01 * coordinates[0] * (0.27 * coordinates[0] + 0.77 * coordinates[1])/2)
				- Math.cos(1.3 + 0.99 * coordinates[1] * (0.88 * coordinates[0] - 0.37 * coordinates[1])/2)
			)/6, 9) * 64
		));
		++built;
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