define([], function() {

	// Must be known in order to produce a valid color range for all possible tiles
	var MAX_TILE_Z = 10;

	function Tile(x, y, z) {
		this.id = this.getIdForCoordinates(x, y);
		this.x = Math.round(x);
		this.y = Math.round(y);
		this.z = Math.round(z || 0);//0.5 * Math.random(); // at sea level, not in use for now

		this.bgColor = this.getFillRgb();

		this.fgColor = this.bgColor.map(function (val) {
			return Math.round(val * 0.7);
		});

		// Will not be open to new generated neighbours once at least this number of neighbors is already present
		this.saturationThreshold = Math.round(3 + Math.random() * 3);

		//this.saturationThreshold = Math.round(1 + Math.random() * 7);
		// this.saturationThreshold = 6; // Yields an octagon-ish shape
	}

	/**
	 * Formats the ID given to a tile for a certain x/y position
	 * @param x
	 * @param y
	 * @returns {string}
	 */
	Tile.prototype.getIdForCoordinates = function (x, y) {
		return x + ',' + y;
	};

	Tile.prototype.getCoordinatesForId  = function (id) {
		return id.split(',').map(function (coord) {
			return parseInt(coord);
		});
	};

	Tile.prototype.getAllNeighbourIds = function () {
		if(!this.neighbourIds)
			this.neighbourIds = [
				this.getIdForCoordinates(this.x, this.y + 1), // North
				this.getIdForCoordinates(this.x - 1, this.y), // West
				this.getIdForCoordinates(this.x + 1, this.y), // East
				this.getIdForCoordinates(this.x, this.y - 1),  // South

				this.getIdForCoordinates(this.x - 1, this.y - 1), // South-west
				this.getIdForCoordinates(this.x + 1, this.y + 1), // North-east
				this.getIdForCoordinates(this.x + 1, this.y - 1), // South-east
				this.getIdForCoordinates(this.x -1 , this.y + 1)  // North-west
			];

		return this.neighbourIds;
	};

	Tile.prototype.getAllNeighbours = function (registry) {
		return this.getAllNeighbourIds().map(function (id) {
			return registry.get(id);
		});
	};

	Tile.prototype.getNeighbours = function (registry) {
		return this.getAllNeighbours(registry).filter(function (tile) {
			return !!tile;
		});
	};

	Tile.prototype.getUnfilledNeighbours = function (registry) {
		return this.getAllNeighbourIds().filter(function (id) {
			return !registry.get(id);
		});
	};

	Tile.prototype.isSaturated = function (registry, saturationThresholdOverride) {
		return this.getNeighbours(registry).length >= (saturationThresholdOverride === undefined
			? this.saturationThreshold
			: saturationThresholdOverride);
	};

	/**
	 *
	 * @param {Renderer} renderer
	 */
	Tile.prototype.render = function (renderer) {
		renderer.setFillColor(this.bgColor.map(function(val) { return val * 1.2; }));
		renderer.fillEastToWestPlane(
			this.x,
			this.y,
			-1,
			1,
			1 + this.z
		);

		renderer.setFillColor(this.bgColor.map(function(val) { return val * 0.6; }));
		renderer.fillNorthToSouthPlane(
			this.x + 1,
			this.y,
			-1,
			1,
			1 + this.z
		);

		renderer.setFillColor(this.bgColor);
		renderer.fillFlatPlane(
			this.x,
			this.y,
			this.z,
			1,
			1
		);

		if(this.saturationThreshold >= 6)
			this.renderRandomArtifact(renderer);
	};

	Tile.prototype.getFillRgb = function () {
		return [
			100 + 100/MAX_TILE_Z * this.z,
			100 + 100/MAX_TILE_Z * this.z,
			100 + 100/MAX_TILE_Z * this.z
//			70 + 10 * Math.random(),
//			140 + 40 * Math.random(),
//			60 + 10 * Math.random()
		].map(function (val) {
			return Math.round(val);
		});
	};

	Tile.prototype.renderRandomArtifact = function (renderer) {
		var buildingSize = [
				0.05 + Math.random() * 0.2,
				0.05 + Math.random() * 0.2,
				0.2 + Math.random() * 0.3
			],
			buildingOffset = [
				Math.random() * (1 - buildingSize[0]),
				Math.random() * (1 - buildingSize[1])
			]
			;
		renderer.setFillColor(this.bgColor.map(function(val) { return val * 1.2; }));
		renderer.fillEastToWestPlane(
			this.x + buildingOffset[0],
			this.y + buildingOffset[1],
			this.z,
			buildingSize[0],
			buildingSize[2]
		);

		renderer.setFillColor(this.bgColor.map(function(val) { return val * 0.6; }));
		renderer.fillNorthToSouthPlane(
			this.x + buildingOffset[0] + buildingSize[0],
			this.y + buildingOffset[1],
			this.z,
			buildingSize[1],
			buildingSize[2]
		);

		renderer.setFillColor(this.bgColor);
		renderer.fillFlatPlane(
			this.x + buildingOffset[0],
			this.y + buildingOffset[1],
			this.z + buildingSize[2],
			buildingSize[0],
			buildingSize[1]
		);
	}

	return Tile;
});