define([
], function(
) {


	// @TODO: Not so ugly plz
	window.TILE_SIZE = 32;
	window.TILE_HEIGHT = window.TILE_SIZE/8;


	var ISOMETRIC_ANGLE = 30 * (Math.PI / 180),
		ISOMETRIC_COS = Math.cos(ISOMETRIC_ANGLE),
		ISOMETRIC_SIN = Math.sin(ISOMETRIC_ANGLE),
		ISOMETRIC_DIST = Math.sqrt(ISOMETRIC_COS*ISOMETRIC_COS + ISOMETRIC_SIN*ISOMETRIC_SIN);


	function Renderer(canvasElement, renderCallback) {
		this.canvas = canvasElement;
		this.context = this.canvas.getContext('2d');
		this.onResize();
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
//
//		this.context.shadowColor = 'rgb(20, 41, 20)';
//		this.context.shadowOffsetY = 6;

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
	 * @param {Number} [z] CURRENTLY IGNORED
	 */
	Renderer.prototype.panToTile = function (x, y, z) {
		var coords = typeof x === 'object' && !!x
			? this.pixelForCoordinates(x.x + 0.5, x.y + 0.5, 0, true)
			: this.pixelForCoordinates(x + 0.5, y + 0.5, 0 || 0, true);

		this.setOffset(
			-coords[0],
			-coords[1]
		)
	};

	Renderer.prototype.pixelForCoordinates = function (x, y, z, omitOffset) {
		var rX = (x + y) * ISOMETRIC_COS,
			rY = (x - y) * ISOMETRIC_SIN;
		return [
			(omitOffset ? 0 : this.offset.x + 0.5 * this.canvas.width)  + rX * TILE_SIZE,
			(omitOffset ? 0 : this.offset.y + 0.5 * this.canvas.height) + rY * TILE_SIZE - TILE_HEIGHT * z
		];
	};

	Renderer.prototype.fillPerfectCircle = function (x, y, z, radius) {
		var center = this.pixelForCoordinates(x, y, z);
		this.context.beginPath();
		this.context.arc(center[0], center[1], radius * TILE_SIZE, 0, 2 * Math.PI);
		this.context.closePath();
		this.context.fill();
		this.context.stroke();
	};

	Renderer.prototype.fillFlatPlane = function (x, y, z, width, height) {
		this.context.strokeStyle = 'rgb(0,0,0)';
		this.context.beginPath();
		[
			this.pixelForCoordinates(x, y, z), // -- links onder
			this.pixelForCoordinates(x + width, y, z), // +- rechts onder
			this.pixelForCoordinates(x + width, y + height, z), // ++ rechts boven
			this.pixelForCoordinates(x, y + height, z)  // -+ links boven
		].forEach(function (coords, i) {
			this.context[i === 0 ? 'moveTo' : 'lineTo'](coords[0], coords[1]);
		}.bind(this));
		this.context.closePath();
		this.context.fill();
		this.context.stroke();
	};

	/**
	 * Render a vertically standing plane, standing on baseline z, from (xa,ya) to (xb,yb), being height high.
	 * @param xa
	 * @param ya
	 * @param z
	 * @param xb
	 * @param yb
	 * @param height
	 */
	Renderer.prototype.fillVerticalPlane = function (xa, ya, z, xb, yb, height) {

		this.context.beginPath();
		[
			this.pixelForCoordinates(xa, ya, z),
			this.pixelForCoordinates(xa, ya, z + height),
			this.pixelForCoordinates(xb, yb, z + height),
			this.pixelForCoordinates(xb, yb, z)
		].forEach(function (coords, i) {
				this.context[i === 0 ? 'moveTo' : 'lineTo'](coords[0], coords[1]);
			}.bind(this));
		this.context.closePath();
		this.context.fill();
		this.context.stroke();
	};

	/**
	 * Ease-of-use for a fillVerticalPlane() oriented west-to-east like a latitude, parallel
	 * @param x
	 * @param y
	 * @param z
	 * @param length
	 * @param height
	 */
	Renderer.prototype.fillEastToWestPlane = function (x, y, z, length, height) {
		this.fillVerticalPlane(x, y, z, x + length, y, height);
	};

	/**
	 * Ease-of-use for a fillVerticalPlane() oriented north-to-south like a longitude, meridian
	 * @param x
	 * @param y
	 * @param z
	 * @param length
	 * @param height
	 */
	Renderer.prototype.fillNorthToSouthPlane = function (x, y, z, length, height) {
		this.fillVerticalPlane(x, y, z, x, y + length, height);
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