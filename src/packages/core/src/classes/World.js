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
	World.prototype.getAreaAroundPosition = function (center, maximumDistance, minimumDistance, includeEmptyPositions, useManhattanDistance) {
		var list = [],
			store = this.tiles;

		minimumDistance = minimumDistance || 0; // Inclusive, and so is maximumDistance

		// Get only tiles within manhattan distance
		for(var y = center.y - maximumDistance; y <= center.y + maximumDistance; ++y) {
			for(var x = center.x - maximumDistance; x <= center.x + maximumDistance; ++x) {
				//

				var tileDistance = useManhattanDistance
					? Math.abs(x - center.x) + Math.abs(y - center.y)
					: Math.floor(util.pythagoras(x - center.x, y - center.y));

				if (tileDistance > maximumDistance || tileDistance < minimumDistance)
					continue;

				var tile = store.get(x + ',' + y);
				if (tile)
					list.push(tile);
				else if (includeEmptyPositions)
					list.push(x + ',' + y);
			}
		}
		return list;
	};

	World.prototype.getTilesWithinRanges = function (center, borders, includeEmpty, includeTooClose, useManhattanDistance) {

		var store = this.tiles,
			maximumDistance = borders[0];

		if(borders.length === 1)
			includeTooClose = true;

		var lists = [];
		for(var b = 0; b < borders.length - (includeTooClose ? 0 : 1); ++b) {
			lists.push([]);
		}

		// Get only tiles within manhattan distance
		for(var y = center.y - maximumDistance; y <= center.y + maximumDistance; ++y) {
			for(var x = center.x - maximumDistance; x <= center.x + maximumDistance; ++x) {
				var distance = useManhattanDistance
					? Math.abs(x - center.x) + Math.abs(y - center.y)
					: util.pythagoras(x - center.x, y - center.y);

				for(var j = borders.length - 1; j >= 0; --j) {
					if(distance > borders[j]) {
						continue;
					}
					if (j < borders.length - 1 || includeTooClose) {
						var tile = store.get(x + ',' + y);
						if (tile)
							lists[j].push(tile);
						else if (includeEmpty)
							lists[j].push(x + ',' + y);
					}

					break;

				}
			}
		}

		return lists;
	};

	World.prototype.generateTilesOnPositions = function (tileIds, randomizeTileOrder) {
		tileIds = randomizeTileOrder ? util.shuffle(tileIds) : tileIds;
		return tileIds.map(function (tileId) {
			var currentValue = this.tiles.get(tileId);

			if(!currentValue)
				currentValue = this.generateNewTile(this.Tile.prototype.getCoordinatesForId(tileId));

			return currentValue;
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
		return this.getAreaAroundPosition(center, distance, minimumDistance, true, false);
	};

	World.prototype.relaxTiles = function (tiles, amount, ignoreEmptyPositions) {
		if(!amount)
			amount = 0.2;
		var iamount = 1 - amount;
		tiles.forEach(function (tile) {

			tile.getAllNeighbours(this.tiles).forEach(function (otherTile) {
				if(otherTile) {
					//var highestZ = otherTile ? (tile.z > otherTile.z ? tile.z : otherTile.z) : tile.z;
					if (otherTile.canStillBeChanged())
						otherTile.z = iamount * otherTile.z + amount * tile.z;
					tile.z = amount * otherTile.z + iamount * tile.z;
				} else if (!ignoreEmptyPositions) {
					tile.z = iamount * iamount * iamount * tile.z;
				}
			});

			++tile.regens;

			if(!tile.canStillBeChanged())
				tile.updateColorsForRegistry(this.tiles)
		}.bind(this));
	};

	World.prototype.relaxAllTiles = function (amount) {
		return this.relaxTiles(this.tiles.list(), amount, false);
	};

	World.prototype.generateNewTile = function (coordinates) {
		return this.tiles.set(new this.Tile(
			coordinates[0],
			coordinates[1],
			Math.pow((4
				+ Math.random()
				+ Math.random()
				+ Math.random()
				+ Math.random()
				//- Math.sin(0.004 * Math.cos(1/(manhattanDistanceFromCenter || 0.001)) * manhattanDistanceFromCenter)
				//+ Math.sin(1.01 * coordinates[0] * (0.27 * coordinates[0] + 0.77 * coordinates[1])/2)
				//- Math.cos(1.3 + 0.99 * coordinates[1] * (0.88 * coordinates[0] - 0.37 * coordinates[1])/2)
			)/8, 13) * 128 - 0.5
		));
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