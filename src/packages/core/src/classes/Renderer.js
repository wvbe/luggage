define([
], function(
) {


	// @TODO: Not so ugly plz


	var ISOMETRIC_ANGLE = 30 * (Math.PI / 180),
		ISOMETRIC_COS = Math.cos(ISOMETRIC_ANGLE),
		ISOMETRIC_SIN = Math.sin(ISOMETRIC_ANGLE),
		ISOMETRIC_TAN = Math.tan(ISOMETRIC_ANGLE),
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

	/**
	 *
	 * @todo make on() and off() methods
	 * @todo share coordinate sets but not drawing/clearing methods between canvases
	 * @param canvasElement
	 * @constructor
	 */
	function Renderer(canvasElement) {
		this.canvas = canvasElement;

		if(canvasElement.localName === 'canvas')
			this.context = this.canvas.getContext('2d');

		this._render = null;

		this.resize();


		window.addEventListener('resize', this.resize.bind(this));
	}

	/**
	 * Set what will happen if the renderer chooses to render
	 * @param renderCallback
	 * @returns {Renderer}
	 */
	Renderer.prototype.onRender = function (renderCallback) {
		this._render = renderCallback;
		return this;
	};

	/**
	 * Actually draw stuff (whatever was configured) to the canvas
	 * @returns {Renderer}
	 */
	Renderer.prototype.render = function () {
		if(!(typeof this._render === 'function'))
			return;

		this._render(this);

		return this;
	};

	/**
	 * Update the canvas after the dimensions might've changed
	 * @returns {Renderer}
	 */
	Renderer.prototype.resize = function () {
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

	/**
	 * Wipe all that was rendered
	 * @returns {Renderer}
	 */
	Renderer.prototype.clear = function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		return this;
	};

	/**
	 * Get the pixel length of one virtual unit of measurement, the absolute zoom value
	 * @returns {number}
	 */
	Renderer.prototype.getTileSize = function () {
		return TILE_SIZE;
	};

	/**
	 * Set the pixel length of a virtual unit of measurement, the absolute zoom value
	 * @param tileSize
	 * @returns {Renderer}
	 */
	Renderer.prototype.setTileSize = function (tileSize) {
		TILE_SIZE = tileSize;
		TILE_HEIGHT = tileSize/6;

		return this;
	};

	/**
	 * Pan render camera to pixel values
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
	/**
	 * Position the canvas element differently (also pixel values) so that it may be transitioned with CSS
	 * @param x
	 * @param y
	 * @returns {Renderer}
	 */
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

	/*
		Get the pixel XY of the center of a (tile?) on a given position
	 */
	function normalizeCoords(x,y,z) {
		return typeof x === 'object' && !!x
			? this.pixelForCoordinates(
				x.x,
				x.y,
			x.z,
			true)
			: this.pixelForCoordinates(
				x,
				y,
			z,
			true);
	}

	/**
	 * Pan render camera towards some virtual coordinates
	 * @param x
	 * @param y
	 * @param z
	 * @returns {*}
	 */
	Renderer.prototype.panToTile = function (x, y, z) {
		var coords = normalizeCoords.apply(this, arguments);

		return this.setOffset(
			-coords[0],
			-coords[1]
		);

	};

	/**
	 * Position the canvas element correlating to some virtual coordinates
	 * @param x
	 * @param y
	 * @param z
	 * @returns {Renderer}
	 */
	Renderer.prototype.panViewportToTile = function (x, y, z) {
		var coords = normalizeCoords.apply(this, arguments);

		return this.setViewportOffset(
			coords[0],
			coords[1]
		);
	};

	/**
	 * Transform virtual coordinates to an X and Y
	 * @param x
	 * @param y
	 * @param z
	 * @param omitOffset
	 * @returns {*[]}
	 */
	Renderer.prototype.pixelForCoordinates = function (x, y, z, omitOffset) {
		var cartX = (x + y) * ISOMETRIC_COS,
			cartY = (x - y) * ISOMETRIC_SIN;
		return [
			(omitOffset ? 0 : VIRTUAL_CAMERA_OFFSET.x + 0.5 * this.canvas.width)  + cartX * TILE_SIZE, // x
			(omitOffset ? 0 : VIRTUAL_CAMERA_OFFSET.y + 0.5 * this.canvas.height) + cartY * TILE_SIZE - TILE_HEIGHT * z // y
		];
	};

	Renderer.prototype.coordinatesForPixel = function (cartX, cartY, omitOffset) {
		// assuming y = ax + b
		cartX = cartX  - 0.5 * this.canvas.width  - (omitOffset ? 0 : VIRTUAL_CAMERA_OFFSET.x);
		cartY = -cartY + 0.5 * this.canvas.height + (omitOffset ? 0 : VIRTUAL_CAMERA_OFFSET.y);

		var isoY = (ISOMETRIC_TAN * cartX + cartY),
			isoX = (cartY - isoY) / -ISOMETRIC_SIN - isoY;

		// this is good so far, b should be rescaled for tile size. as
		return [
			isoX / TILE_SIZE,
			isoY / TILE_SIZE
		];
	};
	/**
	 * Close and fill/stroke the last shape that was drawn
	 * @param strokeColor
	 * @param fillColor
	 * @returns {Renderer}
	 */
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

	Renderer.prototype.strokeLine = function (waypoints, strokeColor) {

	}

	/**
	 * A circle is a circle, but this one is positioned on a set of virtual coordinates
	 * @param x
	 * @param y
	 * @param z
	 * @param radius
	 * @param strokeColor
	 * @param fillColor
	 * @returns {Renderer}
	 */
	Renderer.prototype.fillPerfectCircle = function (x, y, z, radius, strokeColor, fillColor) {
		var center = this.pixelForCoordinates(x, y, z);
		this.context.beginPath();
		this.context.arc(center[0], center[1], radius * TILE_SIZE, 0, 2 * Math.PI);
		this.context.closePath();

		return this.finishLastShape(strokeColor, fillColor);
	};

	/**
	 * Any polygon
	 * @param coordinateSets An array of virtual coordinates for each line joint, the coordinate being the array [x,y,z]
	 * @param strokeColor
	 * @param fillColor
	 * @returns {Renderer}
	 */
	Renderer.prototype.fillSpatialPolygon = function (coordinateSets, strokeColor, fillColor) {
		this.context.beginPath();
		drawSpatialPolygon.call(this, coordinateSets);
		this.context.closePath();
		return this.finishLastShape(strokeColor, fillColor);
	};

	Renderer.prototype.strokeSpatialPolygon = function (coordinateSets, strokeColor, fillColor) {
		this.context.beginPath();
		drawSpatialPolygon.call(this, coordinateSets);
		return this.finishLastShape(strokeColor, fillColor);
	};

	 function drawSpatialPolygon (coordinateSets, strokeColor, fillColor) {
		coordinateSets
			.map(function (coords) {
				return this.pixelForCoordinates(coords[0], coords[1], coords[2]);
			}.bind(this))
			.forEach(function (coords, i) {
				this.context[i === 0 ? 'moveTo' : 'lineTo'](coords[0], coords[1]);
			}.bind(this));

	};

	/**
	 * Render a rectangle as if it were flat on the ground
	 * @param x
	 * @param y
	 * @param z
	 * @param width
	 * @param height
	 * @param strokeColor
	 * @param fillColor
	 * @returns {Renderer}
	 */
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
	 * Render a vertically standing plane, oriented from east to west (latitude)
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
	 * Render a vertically standing plane, oriented from north to south (longitude)
	 * @param x
	 * @param y
	 * @param z
	 * @param length
	 * @param height
	 */
	Renderer.prototype.fillNorthToSouthPlane = function (x, y, z, length, height, strokeColor, fillColor) {
		return this.fillVerticalPlane(x, y, z, x, y + length, z, height, strokeColor, fillColor);
	};

	/**
	 * Render an isometric box
	 * @param x
	 * @param y
	 * @param z
	 * @param width
	 * @param length
	 * @param height
	 * @param strokeColor
	 * @param fillColor
	 * @returns {Renderer}
	 */
	Renderer.prototype.fillBox = function (x, y, z, width, length, height, strokeColor, fillColor) {
		return this
			.fillEastToWestPlane(x, y, z, width, height, strokeColor, fillColor.darkenByRatio(0.1))
			.fillNorthToSouthPlane(x + width, y, z, length, height, strokeColor, fillColor.darkenByRatio(0.2))
			.fillFlatPlane(x, y, z + height, width, length, strokeColor, fillColor);
	};


	/**
	 * Set a fill color for the next shape that is drawn
	 * @todo deprecate
	 * @param color
	 * @returns {Renderer}
	 */
	Renderer.prototype.setFillColor = function(color) {
		this.context.fillStyle = color.toString();

		return this;
	};

	/**
	 * Set a stroke color for the next shape that is drawn
	 * @todo deprecate
	 * @param color
	 * @returns {Renderer}
	 */
	Renderer.prototype.setStrokeColor = function(color) {
		this.context.strokeStyle = color.toString();

		return this;
	};



	return Renderer;
});