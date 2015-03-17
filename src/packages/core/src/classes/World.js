define([
	'config',
	'tiny-emitter',
	'object-store',
	'util',

	'./Tile'
], function(
	config,
	EventEmitter,
	ObjectStore,
	util,

	Tile
) {

	function World() {
		//EventEmitter.call(this);
		ObjectStore.call(this, {
			requireInstanceOf: Tile,
			primaryKey: 'id',
			cacheList: true
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

	function getCoordinatesWithinRanges (center, borders, includeTooClose, useManhattanDistance) {
		var maximumDistance = borders[0];

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
						lists[j].push([x, y]);
					}

					break;

				}
			}
		}

		return lists;
	}
	function getCoordinatesWithinSquare(min, max) {
		var positions = [];

		for (var i = min[0]; i < max[0]; ++i) {
			for (var j = min[1]; j < max[1]; ++j) {
				positions.push([i, j]);
			}
		}

		return positions;
	}
	function reduceNonTiles (getter, includeEmpty, list, coord) {
		var tile = getter(coord);
		if (tile)
			list.push(tile);
		else if (includeEmpty)
			list.push(coord);
		return list;
	}
	World.prototype.getCoordinatesWithinSquare = function (min, max, includeEmpty) {
		return getCoordinatesWithinSquare(min, max, includeEmpty)
			.reduce(reduceNonTiles.bind(undefined, this.get, includeEmpty), []);
	};
	World.prototype.getTilesWithinRanges = function (center, borders, includeEmpty, includeTooClose, useManhattanDistance) {
		return getCoordinatesWithinRanges(center, borders, includeTooClose, useManhattanDistance)
			.reduce(reduceNonTiles.bind(undefined, this.get, includeEmpty), []);
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
		tiles
			.filter(function (tile) {
				return !tile.z > 1;
			})
			.forEach(function (tile) {
				this.generateTilesOnPositions(tile.getUnfilledNeighbours(this));
		}.bind(this));
	};

	World.prototype.getPotentialTilesAroundPosition = function (center, distance, minimumDistance, manhattan) {
		var ranges = minimumDistance ? [distance, minimumDistance] : [distance];
		return this.getTilesWithinRanges(center, ranges, true, !minimumDistance, manhattan)[0]
			.filter(function(tileOrTileId) {
				return Array.isArray(tileOrTileId);
			});
	};

	World.prototype.generateInitialTiles = function (center) {
		if(config.initial.type === 'diamond') {
			this.generateTilesOnPositions(
				this.getPotentialTilesAroundPosition(center, config.initial.radius, false, true));
		}
		if(config.initial.type === 'square') {
			this.generateTilesOnPositions(
				this.getCoordinatesWithinSquare([-config.initial.radius,-config.initial.radius], [config.initial.radius+1,config.initial.radius+1], true));
		}
		if(config.initial.type === 'circle' || config.initial.type === 'grow') {
			this.generateTilesOnPositions(
				this.getPotentialTilesAroundPosition(center, config.initial.radius, false, false));
		}

		if (config.initial.type === 'grow')
			for(var i = 0; i < config.initial.iterations; ++i)
				this.generateNewTiles();

		for(var i = 0; i < config.initial.iterations; ++i) {
			this.relaxAllTiles(0.05, true);
		}
	};

	World.prototype.relaxAllTiles = function (amount, ignoreEmptyPositions) {
		this.relaxTiles(this.list(), amount, ignoreEmptyPositions);
	};
	World.prototype.relaxTiles = function (tiles, amount, ignoreEmptyPositions) {
		var iamount = 1 - amount;
		tiles.forEach(function (tile) {

			tile.getAllNeighbours(this).forEach(function (otherTile) {
				if(otherTile) {
					//var highestZ = otherTile ? (tile.z > otherTile.z ? tile.z : otherTile.z) : tile.z;
					if (otherTile.canStillBeChanged())
						otherTile.z = iamount * otherTile.z + amount * tile.z;

					if (tile.canStillBeChanged())
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
			Math.pow((1 - 2 * Math.random()), 15) * 64 + 2));
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
	World.prototype.renderTiles = function (renderer, tiles) {
		if(tiles === undefined)
			tiles = this.list();

		tiles
			.sort(furthestTilesFirst)
			.forEach(function (tile) {
				tile.render(renderer);
			});
	};
	World.prototype.renderEntities = function (renderer, entities) {
		if(entities === undefined)
			entities = this.entities;

		entities
			.forEach(function (entity) {
				entity.render(renderer);
			});
	};


	World.prototype.removeEntity = function (entity) {
		var i = this.entities.indexOf(entity);
		if(i >= 0)
			this.entities.splice(i, 1);
	};

	// Sort function, used to sort a list of tiles by their X/Y position towards the viewer's perspective.
	function furthestTilesFirst (a, b) {
		if(a.y === b.y)
			return a.x < b.x ? -1 : 1;
		return a.y < b.y ? 1 : -1;
	}
	return World;
});