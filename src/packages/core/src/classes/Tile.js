define([
	'config',
	'Color',
	'util',

	'./ArtifactHouse',
	'./ArtifactVegetation',
	'./ArtifactFence',
	'./ArtifactStones',
	'./MenuItem'
], function(
	config,
	Color,
	util,

	ArtifactHouse,
	ArtifactVegetation,
	ArtifactFence,
	ArtifactStones,
	MenuItem
	) {

	// Must be known in order to produce a valid color range for all possible tiles

	var Z_SEA_LEVEL = 0,
		Z_BEACH_LEVEL = 1.8,
		Z_GRASS_LEVEL = 4,
		Z_BARREN_LEVEL = 10,

		COLOR_UNDETERMINED_FILL = new Color({
			hue: 120,
			saturation: 0.5,
			lightness: 0.3,
			alpha: 0.8
		}),
		COLOR_UNDETERMINED_STROKE = new Color({
			hue: 120,
			saturation: 0.5,
			lightness: 0.3,
			alpha: 1
		});

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
		this.maxRegens = config.initial.iterations - config.initial.iterationsDeviance + util.randomDeviation(config.initial.iterationsDeviance);

		this.menuItems = [];

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

		return neighbourIds.map(function (s) { return s.split(',').map(parseFloat)});
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
		return this.menuItems.concat(this.artifacts.reduce(function (items, artifact) {
			return items.concat(artifact.getMenuItems());
		}, []));
	};

	/**
	 *
	 * @returns {Array<Number>}
	 */
	Tile.prototype.getSurfaceCoordinates = function () {
		return [this.x + 1, this.y, this.z < 0 ? 0 : this.z];
	};

	Tile.prototype.lock = function (registry) {
		if(!this.canStillBeChanged())
			return;

		this.locked = true;

		if(config.renderer.roundZ)
			this.z = Math.round(this.z)

		switch(this.getClimate()) {
			case 'water':
				this.fillColor = config.theme.waterFill;
				this.strokeColor = config.theme.waterStroke;
				return;
			case 'beach':
				var beachNess = 1 - this.z / Z_BEACH_LEVEL;

				this.fillColor = config.theme.grassFill
					.blend(config.theme.beachFill, beachNess)
					.lightenByRatio(0.2);

				this.addArtifact(new ArtifactStones(this, beachNess));

				break;
			case 'grass':
				this.fillColor = config.theme.grassFill;
				break;
			case 'barren':
				// If tile is above a certain level, gradually desaturate and lighten it, making it look like
				// arid rocks and eventually snow.
				var levelOfBarrenness = (this.z - Z_GRASS_LEVEL)/(Z_BARREN_LEVEL-Z_GRASS_LEVEL);

				this.fillColor = config.theme.grassFill
					.blend(config.theme.barrenFill, levelOfBarrenness > 0.4 ? 1 : 0.6 + levelOfBarrenness)
					.lightenByRatio(levelOfBarrenness > 0.5 ? 1 : levelOfBarrenness * 2);

				this.addArtifact(new ArtifactStones(this, 1 - levelOfBarrenness));
				break;
			default:
				console.log('Unknown climate ' + this.getClimate());
				break;
		}

		this.strokeColor = this.fillColor.darkenByRatio(0.3);
		if(this.z > Z_BEACH_LEVEL && this.z < Z_BARREN_LEVEL/2) {
			this.addArtifact(new ArtifactVegetation(
				this,
				this.z < Z_GRASS_LEVEL ? Math.random() : (Z_BARREN_LEVEL/2 - this.z) / (Z_BARREN_LEVEL/2 - Z_GRASS_LEVEL)
			));
			if(Math.random() < 0.1) {
				this.addArtifact(new ArtifactHouse(this));
				if(Math.random() < 0.3) {
					this.addArtifact(new ArtifactFence(this));
				}
			}
		}
	};

	Tile.prototype.getClimate = function () {

		if(this.isWater()) {
			return 'water';
		} else if (this.z <= Z_BEACH_LEVEL) {
			return 'beach';
		} else if (this.z <= Z_GRASS_LEVEL) {
			return 'grass';
		} else {
			return 'barren';
		}
	};

	Tile.prototype.isWalkable = function () {
		return !this.canStillBeChanged() && this.artifacts.every(function (artifact) {
				return artifact.isWalkable()
			});
	};
	Tile.prototype.isWater = function () {
		return this.z <= Z_SEA_LEVEL;
	};

	Tile.prototype.costTowardsTile = function (tile) {
		return 1 + Math.pow(this.z - tile.z, 2) + (tile.isWater() || !tile.isWalkable() ? 1000 : 0);
	};

	Tile.prototype.render = function (renderer) {
		if(this.canStillBeChanged())
			return;

		if(this.isWater()) {
			renderer.fillFlatPlane (
				this.x,
				this.y,
				0,
				1,
				1,
				config.renderer.drawStrokes ? this.strokeColor : null,
				config.renderer.drawFills ? this.fillColor : null
			);
		} else {
			if(config.renderer.type === 'halo')
				renderer.fillTileHalo(
					this,
					config.renderer.drawStrokes ? this.strokeColor : null,
					config.renderer.drawFills ? this.fillColor : null,
					0
				);
			else// if(RENDER_MODE_BOX === 'cube')
				renderer.fillBox(
					this.x,
					this.y,
					0,
					1,
					1,
					this.z,
					config.renderer.drawStrokes ? this.strokeColor : null,
					config.renderer.drawFills ? this.fillColor : null
				);
		}

		// @TODO: Make rendering artifacts optional, possibly based on zoom level
		this.artifacts.forEach(function (artifact) {
			artifact.render(renderer, this);
		}.bind(this));
	};

	Tile.prototype.addArtifact = function (artifact) {
		this.artifacts.push(artifact);
	};

	return Tile;
});