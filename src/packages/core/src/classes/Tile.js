define([
	'Color',
	'util',

	'./ArtifactHouse'
], function(
	Color,
	util,

	ArtifactHouse
	) {

	// Must be known in order to produce a valid color range for all possible tiles

	var Z_SEA_LEVEL = 0,
		Z_BEACH_LEVEL = 1,
		Z_GRASS_LEVEL = 3,
		Z_BARREN_LEVEL = 9,

		// The virtual Z offset that is given to the waterline, to make it more distinct
		ACTUAL_WATERLINE_Z = 0.5,

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
		}),

		COLOR_HOVERED_FILL = new Color('yellow'),
		RENDER_MODE_BOX = 'cube';

	function getIdForCoordinates (x, y) {
		return x + ',' + y;
	}

	function Tile(x, y, z) {
		this.id = getIdForCoordinates(x, y);
		this.x = Math.round(x);
		this.y = Math.round(y);
		this.z = z || (Z_SEA_LEVEL + util.randomDeviation(4));

		this.artifacts = [];

		this.regens = 0;
		this.maxRegens = MAX_TILE_REGENS + util.randomDeviation(2);

//		this.corners = [];

		this.fillColor = COLOR_UNDETERMINED_FILL;

		this.strokeColor = COLOR_UNDETERMINED_STROKE;
	}

	Tile.prototype.canStillBeChanged  = function () {
		return !this.locked;
	};

	Tile.prototype.getAllNeighbourIds = function (ignoreDiagonals) {
		var neighbourIds = [
			getIdForCoordinates.call(this, this.x, this.y + 1), // North
			getIdForCoordinates.call(this, this.x - 1, this.y), // West
			getIdForCoordinates.call(this, this.x + 1, this.y), // East
			getIdForCoordinates.call(this, this.x, this.y - 1)  // South
		];

		if(!ignoreDiagonals)
			neighbourIds = neighbourIds.concat([
				getIdForCoordinates.call(this, this.x - 1, this.y - 1), // South-west
				getIdForCoordinates.call(this, this.x + 1, this.y + 1), // North-east
				getIdForCoordinates.call(this, this.x + 1, this.y - 1), // South-east
				getIdForCoordinates.call(this, this.x -1 , this.y + 1)  // North-west
			]);

		return neighbourIds;
	};

	Tile.prototype.isNeighbourOf = function (tile, ignoreDiagonals) {
		return this.getAllNeighbourIds(ignoreDiagonals).indexOf(tile.id) >= 0;
	};

	Tile.prototype.getAllNeighbours = function (registry, ignoreDiagonals) {
		return this.getAllNeighbourIds(ignoreDiagonals).map(function (id) {
			return registry.get(id);
		});
	};

	/**
	 * @todo contemplate necessity
	 * @param registry
	 * @returns {Array.<T>|*}
	 */
	Tile.prototype.getNeighbours = function (registry, ignoreDiagonals) {
		return this.getAllNeighbours(registry, ignoreDiagonals).filter(function (tile) {
			return !!tile;
		});
	};

	Tile.prototype.getUnfilledNeighbours = function (registry, ignoreDiagonals) {
		return this.getAllNeighbourIds(ignoreDiagonals).filter(function (id) {
			return !registry.get(id);
		});
	};

	Tile.prototype.getMenuItems = function () {
		return this.artifacts.reduce(function (items, artifact) {
			return items.concat(artifact.getMenuItems());
		}, []);
	};

	Tile.prototype.getSurfaceCoordinates = function () {
		return [this.x, this.y, this.z];
	};

	Tile.prototype.triggerArtifactMenu = function () {
		var menuItems = this.getMenuItems();

		console.log('Opening', menuItems);
	};

	Tile.prototype.lock = function (registry) {

		if(!this.canStillBeChanged())
			return;

		this.locked = true;


		var tileRelativeHeight = (this.z > MAX_TILE_Z ? MAX_TILE_Z : this.z) / MAX_TILE_Z;
		var baseColor = new Color({
			hue: 82,
			saturation: 0.5,
			lightness: 0.2 + 0.4 * Math.pow(tileRelativeHeight, 1.5)
		});

		if(this.isWater()) {
			// Keep the default color

		} else if (this.z <= Z_BEACH_LEVEL) {
			// Tile color is a blend between regular and sandy tile color
			this.fillColor = baseColor.blend(new Color({ // beach color
					hue: 30 + util.randomDeviation(4),
					saturation: 0.49 + util.randomDeviation(0.03),
					lightness: 0.60 + util.randomDeviation(0.05)
				}), 0.8);

		} else if (this.z <= Z_GRASS_LEVEL) {
			// Tile color is just the base color
			this.fillColor = baseColor;
		}

		// If tile is above a certain level, gradually desaturate and lighten it, making it look like
		// arid rocks and eventually snow.
		if (this.z > Z_GRASS_LEVEL) {
			var levelOfBarrenness = (this.z - Z_GRASS_LEVEL)/(Z_BARREN_LEVEL-Z_GRASS_LEVEL);
			if(levelOfBarrenness < 0)
				debugger;
			this.fillColor = baseColor
				.desaturateByRatio(levelOfBarrenness > 0.4 ? 1 : 0.6 + levelOfBarrenness)
				.lightenByRatio(levelOfBarrenness > 0.5 ? 1 : levelOfBarrenness * 2);
		} else{
			this.fillColor = this.fillColor.lightenByRatio(0.3);
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
			this.strokeColor = this.fillColor.darkenByRatio(0.3);


		if(!this.isWater() && this.z > Z_BEACH_LEVEL && this.z < Z_GRASS_LEVEL && Math.random() < 0.1)
			this.addArtifact(new ArtifactHouse(this));
	};

	Tile.prototype.isWater = function () {
		return this.z <= Z_SEA_LEVEL;
	};

	Tile.prototype.costTowardsTile = function (tile) {
		return 1 + Math.pow(this.z - tile.z, 2);
	};

	Tile.prototype.render = function (renderer) {
		if(this.isWater()) {
			renderer.fillFlatPlane (
				this.x,
				this.y,
				ACTUAL_WATERLINE_Z,
				1,
				1,
				this.strokeColor,
				this.fillColor.blend(COLOR_HOVERED_FILL, this.hovered ? 0.5 : 0)
			);
		} else {
			if(RENDER_MODE_BOX === 'halo' || this.hovered)
				renderer.fillTileHalo(this, this.strokeColor, this.fillColor.blend(COLOR_HOVERED_FILL, this.hovered ? 0.5 : 0), 0);
			else// if(RENDER_MODE_BOX === 'cube')
				renderer.fillBox(
					this.x,
					this.y,
					0 + ACTUAL_WATERLINE_Z,
					1,
					1,
					this.z + ACTUAL_WATERLINE_Z,
					this.strokeColor,
					this.fillColor.blend(COLOR_HOVERED_FILL, this.hovered ? 0.5 : 0)
				);
		}

		this.artifacts.forEach(function (artifact) {
			artifact.render(renderer, this);
		}.bind(this));
	};

	Tile.prototype.addArtifact = function (artifact) {
		this.artifacts.push(artifact);
	};

	return Tile;
});