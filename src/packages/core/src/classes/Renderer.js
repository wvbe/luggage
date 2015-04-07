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

	var VIRTUAL_CAMERA_OFFSET = {
		x: 0,
		y: 0,
		z: 0
	};

	function Renderer(canvasElement, renderCallback) {
		this.canvas = canvasElement;
		this.context = this.canvas.getContext('2d');
		this.onResize();
		this.render = renderCallback;
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
	Renderer.prototype.setOffset = function (x, y, z) {
		VIRTUAL_CAMERA_OFFSET = {
			x: x,
			y: y,
			z: z
		};
	};
	/**
	 * Pan to the position of a tile
	 * @param {Number|Tile} x
	 * @param {Number} [y]
	 * @param {Number} [z] CURRENTLY IGNORED
	 */
	Renderer.prototype.panToTile = function (x, y, z) {
		var coords = typeof x === 'object' && !!x
			? this.pixelForCoordinates(
				x.x + 0.5,
				x.y + 0.5,
				x.z,
				true)
			: this.pixelForCoordinates(
				x + 0.5,
				y + 0.5,
				z,
				true);

		this.setOffset(
			-coords[0],
			-coords[1]
		);
	};

	Renderer.prototype.pixelForCoordinates = function (x, y, z, omitOffset) {
		var rX = (x + y) * ISOMETRIC_COS,
			rY = (x - y) * ISOMETRIC_SIN;
		return [
			(omitOffset ? 0 : VIRTUAL_CAMERA_OFFSET.x + 0.5 * this.canvas.width)  + rX * TILE_SIZE,
			(omitOffset ? 0 : VIRTUAL_CAMERA_OFFSET.y + 0.5 * this.canvas.height) + rY * TILE_SIZE - TILE_HEIGHT * z
		];
	};

	Renderer.prototype.finishLastShape = function (strokeColor, fillColor) {
		if(fillColor) {
			this.setFillColor(fillColor);
			this.context.fill();
		}
		if(strokeColor) {
			this.setStrokeColor(strokeColor);
			this.context.stroke();
		}
	};
	Renderer.prototype.fillPerfectCircle = function (x, y, z, radius, strokeColor, fillColor) {
		var center = this.pixelForCoordinates(x, y, z);
		this.context.beginPath();
		this.context.arc(center[0], center[1], radius * TILE_SIZE, 0, 2 * Math.PI);
		this.context.closePath();
		this.finishLastShape(strokeColor, fillColor);
	};

	Renderer.prototype.fillFlatPlane = function (x, y, z, width, height, strokeColor, fillColor) {
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
		this.finishLastShape(strokeColor, fillColor);
	};

	/**
	 * Render a vertically standing plane, standing on baseline z, from (xa,ya,za) to (xb,yb,zb), being height high.
	 * @param xa
	 * @param ya
	 * @param za
	 * @param xb
	 * @param yb
	 * @param zb
	 * @param height
	 */
	Renderer.prototype.fillVerticalPlane = function (xa, ya, za, xb, yb, zb, height, strokeColor, fillColor) {

		this.context.beginPath();
		[
			this.pixelForCoordinates(xa, ya, za),
			this.pixelForCoordinates(xa, ya, za + height),
			this.pixelForCoordinates(xb, yb, zb + height),
			this.pixelForCoordinates(xb, yb, zb)
		].forEach(function (coords, i) {
				this.context[i === 0 ? 'moveTo' : 'lineTo'](coords[0], coords[1]);
			}.bind(this));
		this.context.closePath();
		this.finishLastShape(strokeColor, fillColor);
	};

	/**
	 * Ease-of-use for a fillVerticalPlane() oriented west-to-east like a latitude, parallel
	 * @param x
	 * @param y
	 * @param z
	 * @param length
	 * @param height
	 */
	Renderer.prototype.fillEastToWestPlane = function (x, y, z, length, height, strokeColor, fillColor) {
		this.fillVerticalPlane(x, y, z, x + length, y, z, height, strokeColor, fillColor);
	};

	/**
	 * Ease-of-use for a fillVerticalPlane() oriented north-to-south like a longitude, meridian
	 * @param x
	 * @param y
	 * @param z
	 * @param length
	 * @param height
	 */
	Renderer.prototype.fillNorthToSouthPlane = function (x, y, z, length, height, strokeColor, fillColor) {
		this.fillVerticalPlane(x, y, z, x, y + length, z, height, strokeColor, fillColor);
	};
	
	Renderer.prototype.fillBox = function (x, y, z, width, length, height, strokeColor, fillColor) {
		this.fillEastToWestPlane(x, y, z, width, height, strokeColor, fillColor.darkenByRatio(0.3));
		this.fillNorthToSouthPlane(x + width, y, z, length, height, strokeColor, fillColor.darkenByRatio(0.6));
		this.fillFlatPlane(x, y, z + height, width, length, strokeColor, fillColor);
	};


	Renderer.prototype.setFillColor = function(color) {
		this.context.fillStyle = color.toString();
	};

	Renderer.prototype.setStrokeColor = function(color) {
		this.context.strokeStyle = color.toString();
	};

	/**
	 *
	 * @TODO Make unspecific for tiles by removing/repurposing "furthestTilesFirst" sorter
	 */
	Renderer.prototype.renderTiles = function (tiles) {
		tiles
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

	return Renderer;
});