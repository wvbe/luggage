define([
	'Color'
], function(
	Color
	) {

	// Must be known in order to produce a valid color range for all possible tiles
	var MAX_TILE_Z = 12;

	function Tile(x, y, z) {
		this.id = this.getIdForCoordinates(x, y);
		this.x = Math.round(x);
		this.y = Math.round(y);
		this.z = z || 0;//0.5 * Math.random(); // at sea level, not in use for now

		this.fillColor = null;
		this.strokeColor = new Color([0, 0, 0]);

		// Will not be open to new generated neighbours once at least this number of neighbors is already present
		//this.saturationThreshold = Math.round(3 + 3 * this.z/7);
		this.saturationThreshold = 3 + Math.random() * 3;

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
		renderer.fillBox(this.x, this.y, -1, 1, 1, 1 + this.z, this.strokeColor, this.fillColor.lightenByRatio(0.3));

		if((this.saturationThreshold >= 5.8 && this.z < 5)
			||(this.saturationThreshold >= 3 && this.z < 1))
			this.renderRandomArtifact(renderer);
	};

	Tile.prototype.getFillRgb = function () {
		return new Color({
			hue: 82,
			saturation: 0.5,
			lightness: 0.2 + 0.5 * Math.pow(this.z/MAX_TILE_Z, 1.5)
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
			];

		renderer.fillBox(
			this.x + buildingOffset[0],
			this.y + buildingOffset[1],
			this.z,
			buildingSize[0],
			buildingSize[1],
			buildingSize[2],
			this.strokeColor,
			this.fillColor.lightenByRatio(0.7)
		);
	};

	return Tile;
});