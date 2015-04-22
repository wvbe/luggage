define([
	'tiny-emitter',
	'object-store',
	'util',

	'./Tile'
], function(
	EventEmitter,
	ObjectStore,
	util,

	Tile
) {

	function World() {
		//EventEmitter.call(this);
		ObjectStore.call(this, {
			requireInstanceOf: Tile,
			primaryKey: 'id'
		});

		this.entities = [];
	}


	World.prototype = Object.create(ObjectStore.prototype);
	World.prototype.constructor = World;

	/*
		Wrap two ObjectStore methods so that they would eat a coordinate set as well
	 */
	World.prototype.get = function (id) {
		if(Array.isArray(id))
			id = id.join(',');
		return ObjectStore.prototype.get.call(this, id);
	};
	World.prototype.delete = function (id) {
		if(Array.isArray(id))
			id = id.join(',');
		return ObjectStore.prototype.delete.call(this, id);
	};

	World.prototype.tileForCoordinates = function (coordinates) {
		if(typeof coordinates === 'string')
			coordinates = coordinates.split(',').map(parseFloat);
		if(typeof coordinates === 'object' && !Array.isArray(coordinates))
			coordinates = [coordinates.x, coordinates.y];

		return this.get(coordinates.map(Math.floor));
	};
	World.prototype.getTilesWithinRanges = function (center, borders, includeEmpty, includeTooClose, useManhattanDistance) {

		var store = this,
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
						var tile = store.get([x, y]);
						if (tile)
							lists[j].push(tile);
						else if (includeEmpty)
							lists[j].push([x, y]);
					}

					break;

				}
			}
		}

		return lists;
	};

	World.prototype.getRandomTile = function () {
		return util.randomFromArray(this.list().filter(function (tile) {
			return !tile.canStillBeChanged() && !tile.isWater();
		}));
	};

	World.prototype.generateTilesOnPositions = function (tileIds, randomizeTileOrder) {
		tileIds = randomizeTileOrder ? util.shuffle(tileIds) : tileIds;
		return tileIds.map(function (tileId) {
			var currentValue = this.get(tileId);

			if(!currentValue)
				currentValue = this.generateNewTile(tileId);

			return currentValue;
		}.bind(this));
	};

	/**
	 * Generates new neighbour tiles for *unsaturated* tiles
	 */
	World.prototype.generateNewTiles = function () {
		var tiles = this.list();
		if(!tiles.length)
			this.generateNewTile([0, 0]);
		tiles.forEach(function (tile) {
			this.generateTilesOnPositions(tile.getUnfilledNeighbours(this));
		}.bind(this));
	};

	World.prototype.getPotentialTilesAroundPosition = function (center, distance, minimumDistance) {
		var ranges = minimumDistance ? [distance, minimumDistance] : [distance];
		return this.getTilesWithinRanges(center, ranges, true, !minimumDistance, false).filter(function (tileOrTileId) {
			return Array.isArray(tileOrTileId);
		});
	};

	World.prototype.relaxTiles = function (tiles, amount, ignoreEmptyPositions) {
		if(!amount)
			amount = 0.2;
		var iamount = 1 - amount;
		tiles.forEach(function (tile) {

			tile.getAllNeighbours(this).forEach(function (otherTile) {
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

			if(tile.regens >= tile.maxRegens)
				tile.lock(this)
		}.bind(this));
	};

	World.prototype.generateNewTile = function (coordinates) {
		return this.set(new Tile(
			coordinates[0],
			coordinates[1],
			Math.pow((1 - 2 * Math.random()), 15) * 64 + 1));
	};


	/**
	 * Returns a "landing zone", aka spawn area
	 * @returns {Object}
	 */
	World.prototype.getSpawnTile = function () {
		return this.get([0,0]) || this.generateNewTile([0,0]);
	};

	/**
	 *
	 * @TODO Make unspecific for tiles by removing/repurposing "furthestTilesFirst" sorter
	 */
	World.prototype.renderTiles = function (renderer) {
		this.list()
			.sort(furthestTilesFirst)
			.forEach(function (tile) {
				tile.render(renderer);
			});

		this.entities.forEach(function (entity) {
			entity.render(renderer);
		})
	};


	// Sort function, used to sort a list of tiles by their X/Y position towards the viewer's perspective.
	function furthestTilesFirst (a, b) {
		if(a.y === b.y)
			return a.x < b.x ? -1 : 1;
		return a.y < b.y ? 1 : -1;
	}
	return World;
});