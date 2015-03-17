define([], function() {

	function Tile(x, y) {
		this.id = this.getIdForCoordinates(x, y);
		this.x = x;
		this.y = y;
		this.z = 0;//.1 * Math.random(); // at sea level, not in use for now

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
		return [
			this.getIdForCoordinates(this.x, this.y + 1), // North
			this.getIdForCoordinates(this.x - 1, this.y), // West
			this.getIdForCoordinates(this.x + 1, this.y), // East
			this.getIdForCoordinates(this.x, this.y - 1),  // South

			this.getIdForCoordinates(this.x - 1, this.y - 1), // South-west
			this.getIdForCoordinates(this.x + 1, this.y + 1), // North-east
			this.getIdForCoordinates(this.x + 1, this.y - 1), // South-east
			this.getIdForCoordinates(this.x -1 , this.y + 1)  // North-west
		];
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

	Tile.prototype.render = function (renderer) {
		renderer.setFillColor(this.bgColor);
		//renderer.setStrokeColor(this.fgColor);
		renderer.fillFlatPlane(
			this.x,
			this.y,
			this.z,
			1,
			1
		);
	};

	Tile.prototype.getFillRgb = function () {
		return [
			70 + 10 * Math.random(),
			140 + 40 * Math.random(),
			60 + 10 * Math.random()
		].map(function (val) {
			return Math.round(val);
		});
	};

	return Tile;
});