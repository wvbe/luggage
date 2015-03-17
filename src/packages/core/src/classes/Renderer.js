define([
], function(
) {


	// @TODO: Pannable viewport & shit
	var TILE_SIZE = 32;

	var ISOMETRIC_Y_TO_X_OFFSET = 0.3, // For every n on the Y axis, displace n*OFFSET to the right
		ISOMETRIC_Y_TO_X_RATIO = 0.6,  // n on the Y axis is always this ratio of (horizontal) units
		ISOMETRIC_Z_TO_X_RATIO = 1; // n on the Z axis is always this ratio of (horizontal) units

	function Renderer(canvasElement, renderCallback) {
		this.canvas = canvasElement;
		this.context = this.canvas.getContext('2d');
		this.render = renderCallback;
		this.offset = {
			x: 0,
			y: 0
		};
		window.addEventListener('resize', this.onResize.bind(this));
	}

	Renderer.prototype.onResize = function () {
		var bb = this.canvas.getBoundingClientRect(),
			newWidth = parseInt(bb.width),
			newHeight = parseInt(bb.height);

		if(this.canvas.width === newWidth && this.canvas.height === newHeight)
			return;

		this.canvas.width = newWidth;
		this.canvas.height = newHeight;

		//this.context.shadowColor = 'rgb(20, 41, 20)';
		//this.context.shadowOffsetY = 6;

		if(typeof this.render === 'function')
			this.render();
	};
	Renderer.prototype.clear = function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	};



	/**
	 * Pan to pixel values
	 * @param {Number} x
	 * @param {Number} y
	 */
	Renderer.prototype.setOffset = function (x, y) {
		this.offset = {
			x: x,
			y: y
		}
	};
	/**
	 * Pan to the position of a tile
	 * @param {Number|Tile} x
	 * @param {Number} [y]
	 * @param {Number} [z]
	 */
	Renderer.prototype.panToTile = function (x, y, z) {
		var coords = typeof x === 'object' && !!x
			? this.pixelForCoordinates(x.x, x.y, x.z, true)
			: this.pixelForCoordinates(x, y, z || 0, true);

		this.setOffset(
			-coords[0],
			-coords[1]
		)
	};

	var ISOMETRIC_ANGLE = 30 * (Math.PI / 180),
		ISOMETRIC_COS = Math.cos(ISOMETRIC_ANGLE),
		ISOMETRIC_SIN = Math.sin(ISOMETRIC_ANGLE),
		ISOMETRIC_DIST = Math.sqrt(ISOMETRIC_COS*ISOMETRIC_COS + ISOMETRIC_SIN*ISOMETRIC_SIN);

	Renderer.prototype.pixelForCoordinates = function (x, y, z, omitOffset) {
		var rX = (x + y) * ISOMETRIC_COS,
			rY = (x - y) * ISOMETRIC_SIN;
		return [
			(omitOffset ? 0 : this.offset.x + 0.5 * this.canvas.width)  + rX * TILE_SIZE,
			(omitOffset ? 0 : this.offset.y + 0.5 * this.canvas.height) + rY * TILE_SIZE
		];
	};

	Renderer.prototype.fillFlatPlane = function (x, y, z, width, height) {
		var spaceBetween = -0.01; // Slight overlap
		this.context.beginPath();
		[
			this.pixelForCoordinates(x - width/2 + spaceBetween, y - height/2 + spaceBetween, z),
			this.pixelForCoordinates(x + width/2 - spaceBetween, y - height/2 + spaceBetween, z),
			this.pixelForCoordinates(x + width/2 - spaceBetween, y + height/2 - spaceBetween, z),
			this.pixelForCoordinates(x - width/2 + spaceBetween, y + height/2 - spaceBetween, z)
		].forEach(function (coords, i) {
			this.context[i === 0 ? 'moveTo' : 'lineTo'](coords[0], coords[1]);
		}.bind(this));
		this.context.closePath();
		this.context.fill();
	};

	Renderer.prototype.setFillColor = function(color) {
		if(Array.isArray(color))
			color = 'rgb' + (color.length === 4 ? 'a' : '') + '(' + color.join(',') + ')';
		this.context.fillStyle = color;
	};

	Renderer.prototype.setFillColor = function(color) {
		this.context.fillStyle = normalizeColorCode(color);
	};

	Renderer.prototype.setStrokeColor = function(color) {
		this.context.strokeStyle = normalizeColorCode(color);
	};
	/**
	 *
	 */
	Renderer.prototype.renderAllTiles = function (world) {
		var renderer = this.renderer;

		world.tiles.list()
			.sort(furthestTilesFirst)
			.forEach(function (tile) {
				tile.render(renderer);
			});
	};

	Renderer.prototype.renderAroundTile = function (world, tile, distance) {
		world.getAreaAroundPosition(tile, distance)
			.sort(furthestTilesFirst)
			.forEach(function (tile) {
				tile.render(this);
			}.bind(this));
	};

	// Sort function, used to sort a list of tiles by their X/Y position towards the viewer's perspective.
	function furthestTilesFirst (a, b) {
		if(a.y === b.y)
			return a.x < b.x ? -1 : 1;
		return a.y < b.y ? 1 : -1;
	}

	function normalizeColorCode (color) {
		if(Array.isArray(color))
			color = 'rgb' + (color.length === 4 ? 'a' : '') + '(' + color.map(function(val, i) { return i < 3 ? Math.round(val) : val; }).join(',') + ')';
		return color;
	}
	return Renderer;
});