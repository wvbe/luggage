define([
	'tiny-emitter',
	'object-store',
	'util'
], function(
	EventEmitter,
	ObjectStore,
	util
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
	World.prototype.getAreaAroundPosition = function (center, maximumDistance, minimumDistance, getEmptyPositionsInstead) {
		var list = [],
			store = this.tiles;

		minimumDistance = minimumDistance || 0; // Inclusive, and so is maximumDistance

		// Get only tiles within manhattan distance
		for(var y = center.y - maximumDistance; y <= center.y + maximumDistance; ++y) {
			for(var x = center.x - maximumDistance; x <= center.x + maximumDistance; ++x) {
				var tileDistance = Math.floor(util.pythagoras(x - center.x, y - center.y));
				if(tileDistance > maximumDistance || tileDistance < minimumDistance)
					continue;

				var tile = store.get(x + ',' + y);
				if(tile && !getEmptyPositionsInstead)
					list.push(tile);
				if(getEmptyPositionsInstead && !tile)
					list.push(x + ',' + y);
			}
		}
		return list;
	};

	World.prototype.generateTilesOnPositions = function (tileIds, randomizeTileOrder) {
		tileIds = randomizeTileOrder ? util.shuffle(tileIds) : tileIds;
		tileIds.forEach(function (tileId) {
			this.generateNewTile(this.Tile.prototype.getCoordinatesForId(tileId));
		}.bind(this));
	};

	/**
	 * Generates new neighbour tiles for *unsaturated* tiles
	 */
	World.prototype.generateNewTiles = function (saturationThresholdOverride) {
		var tiles = this.tiles.list();
		if(!tiles.length)
			this.generateNewTile([0, 0]);
		tiles.forEach(function (tile) {
			if(tile.isSaturated(this.tiles, saturationThresholdOverride))
				return;
			this.generateTilesOnPositions(tile.getUnfilledNeighbours(this.tiles));
		}.bind(this));
	};

	World.prototype.getPotentialTilesAroundPosition = function (center, distance, minimumDistance) {
		return this.getAreaAroundPosition(center, distance, minimumDistance, true)
			.filter(function(tile) {
				console.log(tile);
			});
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



	return World;
});