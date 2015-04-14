define([
], function(
) {


	// @TODO: Not so ugly plz


	var ISOMETRIC_ANGLE = 30 * (Math.PI / 180),
		ISOMETRIC_COS = Math.cos(ISOMETRIC_ANGLE),
		ISOMETRIC_SIN = Math.sin(ISOMETRIC_ANGLE),
		ISOMETRIC_DIST = Math.sqrt(ISOMETRIC_COS*ISOMETRIC_COS + ISOMETRIC_SIN*ISOMETRIC_SIN); // the length of a diagonal, in pixels

	var TILE_SIZE = 32,
		TILE_HEIGHT = TILE_SIZE/6;

	var VIRTUAL_CAMERA_OFFSET = {
			x: 0,
			y: 0
		},
		ABSOLUTE_VIEWPORT_OFFSET = {
			x: 0,
			y: 0
		};

	function Renderer(canvasElement) {
		this.canvas = canvasElement;
		this.context = this.canvas.getContext('2d');

		this._render = null;

		this.onResize();


		window.addEventListener('resize', this.onResize.bind(this));
	}

	Renderer.prototype.onRender = function (renderCallback) {
		this._render = renderCallback;
		return this;
	};

	Renderer.prototype.render = function () {
		if(!(typeof this._render === 'function'))
			return;

		this._render(this);

		return this;
	};

	Renderer.prototype.onResize = function () {
		var bb = this.canvas.getBoundingClientRect(),
			newWidth = parseInt(bb.width),
			newHeight = parseInt(bb.height);

		if(this.canvas.width === newWidth && this.canvas.height === newHeight)
			return this;

		this.canvas.width = newWidth;
		this.canvas.height = newHeight;
//
//		this.context.shadowColor = 'rgb(20, 41, 20)';
//		this.context.shadowOffsetY = 6;

		if(typeof this.render === 'function')
			this.render();

		return this;
	};
	Renderer.prototype.clear = function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		return this;
	};



	Renderer.prototype.getTileSize = function (x, y, z) {
		return TILE_SIZE;
	};
	Renderer.prototype.setTileSize = function (tileSize) {
		TILE_SIZE = tileSize;
		TILE_HEIGHT = tileSize/6;

		return this;
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

		return this;
	};
	Renderer.prototype.setViewportOffset = function (x, y) {
		ABSOLUTE_VIEWPORT_OFFSET = {
			x: -x,
			y: -y
		};
		this.canvas.classList.add('transitioning');
		this.canvas.style.top = ABSOLUTE_VIEWPORT_OFFSET.y + 'px';
		this.canvas.style.left = ABSOLUTE_VIEWPORT_OFFSET.x + 'px';
		this.canvas.style.marginTop = -ABSOLUTE_VIEWPORT_OFFSET.y + 'px';
		this.canvas.style.marginLeft = -ABSOLUTE_VIEWPORT_OFFSET.x + 'px';

		return this;
	};
	/**
	 * Pan to the position of a tile
	 * @param {Number|Tile} x
	 * @param {Number} [y]
	 * @param {Number} [z] CURRENTLY IGNORED
	 */
	function normalizeCoords(x,y,z) {
		return typeof x === 'object' && !!x
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
	}

	Renderer.prototype.panToTile = function (x, y, z) {
		var coords = normalizeCoords.apply(this, arguments);

		return this.setOffset(
			-coords[0],
			-coords[1]
		);

	};
	Renderer.prototype.panViewportToTile = function (x, y, z) {
		var coords = normalizeCoords.apply(this, arguments);

		return this.setViewportOffset(
			coords[0],
			coords[1]
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
			if(fillColor.alpha)
				this.context.fill();
		}
		if(strokeColor) {
			this.setStrokeColor(strokeColor);
			if(strokeColor.alpha)
				this.context.stroke();
		}

		return this;
	};
	Renderer.prototype.fillPerfectCircle = function (x, y, z, radius, strokeColor, fillColor) {
		var center = this.pixelForCoordinates(x, y, z);
		this.context.beginPath();
		this.context.arc(center[0], center[1], radius * TILE_SIZE, 0, 2 * Math.PI);
		this.context.closePath();

		return this.finishLastShape(strokeColor, fillColor);
	};

	Renderer.prototype.fillSpatialPolygon = function (coordinateSets, strokeColor, fillColor) {
		this.context.beginPath();

		coordinateSets
			.map(function (coords) {
				return this.pixelForCoordinates(coords[0], coords[1], coords[2]);
			}.bind(this))
			.forEach(function (coords, i) {
				this.context[i === 0 ? 'moveTo' : 'lineTo'](coords[0], coords[1]);
			}.bind(this));
		this.context.closePath();

		return this.finishLastShape(strokeColor, fillColor);
	};

	Renderer.prototype.fillFlatPlane = function (x, y, z, width, height, strokeColor, fillColor) {
		this.context.beginPath();

		return this.fillSpatialPolygon([
			[x, y, z], // -- links onder
			[x + width, y, z], // +- rechts onder
			[x + width, y + height, z], // ++ rechts boven
			[x, y + height, z]  // -+ links boven
		], strokeColor, fillColor);
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

		return this.finishLastShape(strokeColor, fillColor);
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
		return this.fillVerticalPlane(x, y, z, x + length, y, z, height, strokeColor, fillColor);
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
		return this.fillVerticalPlane(x, y, z, x, y + length, z, height, strokeColor, fillColor);
	};
	
	Renderer.prototype.fillBox = function (x, y, z, width, length, height, strokeColor, fillColor) {
		return this
			.fillEastToWestPlane(x, y, z, width, height, strokeColor, fillColor.darkenByRatio(0.1))
			.fillNorthToSouthPlane(x + width, y, z, length, height, strokeColor, fillColor.darkenByRatio(0.2))
			.fillFlatPlane(x, y, z + height, width, length, strokeColor, fillColor);
	};


	Renderer.prototype.setFillColor = function(color) {
		this.context.fillStyle = color.toString();

		return this;
	};

	Renderer.prototype.setStrokeColor = function(color) {
		this.context.strokeStyle = color.toString();

		return this;
	};



	return Renderer;
});