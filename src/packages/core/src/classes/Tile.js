define([
	'Color'
], function(
	Color
	) {

	// Must be known in order to produce a valid color range for all possible tiles

	var Z_SEA_LEVEL = 0,
		Z_BEACH_LEVEL = 1,
		Z_GRASS_LEVEL = 3,
		Z_BARREN_LEVEL = 9,

		MAX_TILE_Z = Z_BARREN_LEVEL,

		MAX_TILE_REGENS = 9,

		COLOR_UNDETERMINED_FILL = new Color({
			hue: 0,
			saturation: 0,
			lightness: 1,
			alpha: 0.2
		}),
		COLOR_UNDETERMINED_STROKE = new Color({
			hue: 0,
			saturation: 0,
			lightness: 0.3,
			alpha: 0.3
		});

	function Tile(x, y, z) {
		this.id = this.getIdForCoordinates(x, y);
		this.x = Math.round(x);
		this.y = Math.round(y);
		this.z = z || 0;//0.5 * Math.random(); // at sea level, not in use for now
		this.regens = 0;
		this.maxRegens = MAX_TILE_REGENS + randomRatio(2);

//		this.corners = [];

		this.fillColor = COLOR_UNDETERMINED_FILL;

		this.strokeColor = COLOR_UNDETERMINED_STROKE;

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
	Tile.prototype.canStillBeChanged  = function () {
		return this.regens < this.maxRegens;
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


	function randomRatio (max) {
		if (max === undefined)
			max = 1;
		return max * (1 - Math.random() * 2);
	}
	Tile.prototype.updateColorsForRegistry = function (registry) {
		if(this.canStillBeChanged())
			return;



		var tileRelativeHeight = this.z / MAX_TILE_Z;

		var baseColor = new Color({
			hue: 82,
			saturation: 0.5,
			lightness: 0.2 + 0.4 * Math.pow(tileRelativeHeight, 1.5)
		});

		if(this.isWater()) {
//			this.fillColor = new Color({ // water
//					hue: 189 + randomRatio(4),
//					saturation: 0.77 + randomRatio(0.03),
//					lightness: this.z/4 * 0.32 + randomRatio(0.05),
//					alpha: 0.7
//				});

		} else if (this.z <= Z_BEACH_LEVEL) {
			this.fillColor = baseColor.blend(new Color({ // beach color
					hue: 30 + randomRatio(4),
					saturation: 0.49 + randomRatio(0.03),
					lightness: 0.60 + randomRatio(0.05)
				}), 0.8);

		} else if (this.z <= Z_GRASS_LEVEL) {
			this.fillColor = baseColor;
			// maintain normal color
		}

		if (this.z > Z_GRASS_LEVEL && this.z <= Z_BARREN_LEVEL) {
			var levelOfBarrenness = (this.z - Z_GRASS_LEVEL)/(Z_BARREN_LEVEL-Z_GRASS_LEVEL);
			this.fillColor = baseColor
				.desaturateByRatio(levelOfBarrenness > 0.4 ? 1 : 0.6 + levelOfBarrenness)
				.lightenByRatio(levelOfBarrenness > 0.5 ? 1 : levelOfBarrenness * 2);
		}

//		this.corners = [
//			[-1, -1],
//			[1, -1],
//			[1, 1],
//			[-1, 1],
//		].map(function (relativeCoordinates) {
//			return [
//				this,
//				registry.get(this.getIdForCoordinates(this.x + relativeCoordinates[0], this.y + relativeCoordinates[1])),
//				registry.get(this.getIdForCoordinates(this.x + relativeCoordinates[0], this.y)),
//				registry.get(this.getIdForCoordinates(this.x, this.y + relativeCoordinates[1]))
//			].reduce(function (totalZ, tile) {
//				if(!(tile && tile instanceof Tile))
//					totalZ = totalZ + this.z;
//				else
//					totalZ = totalZ + tile.z;
//				return totalZ;
//			}, 0)/4;
//		}.bind(this));


		if(!this.isWater())
			this.strokeColor = this.fillColor.darkenByRatio(0.1);

	};

	Tile.prototype.isWater = function () {
		return this.z <= Z_SEA_LEVEL;
	};
	/**
	 *
	 * @param {Renderer} renderer
	 */

	function equalizeCornerZIfCloseEnough(coords, corner, z) {
		if(Math.abs(corner - z) < 2)
			return coords.concat([corner || ACTUAL_WATERLINE_Z]);
		return coords.concat([z || ACTUAL_WATERLINE_Z]);
	}

	var ACTUAL_WATERLINE_Z = -0.5;
	Tile.prototype.render = function (renderer) {
		if(this.isWater()) {
			renderer.fillFlatPlane (
				this.x,
				this.y,
				ACTUAL_WATERLINE_Z,
				1,
				1,
				this.strokeColor,
				this.fillColor.lightenByRatio(0.3)
			);
		} else {
			renderer.fillBox(
				this.x,
				this.y,
				0 + ACTUAL_WATERLINE_Z,
				1,
				1,
				this.z + ACTUAL_WATERLINE_Z + 1,
				this.strokeColor,
				this.fillColor.lightenByRatio(0.3));

		}
		//Z_SEA_LEVEL
		if(
			!this.canStillBeChanged() // Must be fully computed
			&& this.z > Z_BEACH_LEVEL // And cannot be on or below a beach
			&& this.z <= Z_GRASS_LEVEL // And should be on or below grass
			&& Math.random() < 0.1 // Only one out of 10 elegible tiles actually get an artifac
		)
			this.renderRandomArtifact(renderer);
	};

	Tile.prototype.markAsLastSeen = function (registry) {
		if(this.timeout) {
			clearTimeout(this.timeout);
		}

		this.timeout = setTimeout(function () {
			registry.delete(this.x + ',' + this.y);
		}.bind(this), 5000);
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