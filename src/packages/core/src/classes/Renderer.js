define([
], function(
) {
	var ABSOLUTE_VIEWPORT_OFFSET = {
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
	function Renderer(perspective, canvasElement) {
		this.perspective = perspective;
		this.canvas = canvasElement;

		if(canvasElement.localName === 'canvas')
			this.context = this.canvas.getContext('2d');

		this._render = null;

		this.resize(perspective);

		perspective.on('resize', this.resize.bind(this));
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
			return this;

		this._render(this);

		return this;
	};

	/**
	 * Update the canvas after the dimensions might've changed
	 * @returns {Renderer}
	 */
	Renderer.prototype.resize = function (perspective) {
		this.canvas.width = perspective.size.x;
		this.canvas.height = perspective.size.y;

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
			? this.perspective.pixelForCoordinates(
				x.x + 0.5,
				x.y + 0.5,
				x.z,
				true)
			: this.perspective.pixelForCoordinates(
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

		this.perspective.setOffset(
			-coords[0],
			-coords[1]
		);

		return this;
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
		var center = this.perspective.pixelForCoordinates(x, y, z);
		this.context.beginPath();
		this.context.arc(center[0], center[1], radius * this.perspective.getTileSize(), 0, 2 * Math.PI);
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

	Renderer.prototype.strokeSpatialLines = function (coordinateSets, strokeColor, fillColor) {
		this.context.beginPath();
		drawSpatialPolygon.call(this, coordinateSets);
		return this.finishLastShape(strokeColor, fillColor);
	};

	Renderer.prototype.strokeSpatialBezier = function (coordinateSets, strokeColor, fillColor) {
		this.context.beginPath();

		coordinateSets = coordinateSets
			.map(function (coords) {
				return this.perspective.pixelForCoordinates(coords[0], coords[1], coords[2]);
			}.bind(this));

		// http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
		this.context.moveTo(coordinateSets[0][0], coordinateSets[0][1]);
		for (i = 1; i < coordinateSets.length - 2; i ++) {
			var xc = (coordinateSets[i][0] + coordinateSets[i + 1][0]) / 2;
			var yc = (coordinateSets[i][1] + coordinateSets[i + 1][1]) / 2;
			this.context.quadraticCurveTo(coordinateSets[i][0], coordinateSets[i][1], xc, yc);
		}
		// curve through the last two coordinateSets
		this.context.quadraticCurveTo(coordinateSets[i][0], coordinateSets[i][1], coordinateSets[i+1][0],coordinateSets[i+1][1]);

		return this.finishLastShape(strokeColor, fillColor);
	};
	/**
	 * Renders te outer contours of a box
	 */
	Renderer.prototype.strokeBoxHalo = function (x, y, z, width, length, height, strokeColor, fillColor, haloOffset) {
		var minCoords = [x,y,z],
			size = [width, length, height];
		return this.fillSpatialPolygon([
			[1,1,0],
			[1,1,1],
			[0,1,1],
			[0,0,1],
			[0,0,0],
			[1,0,0]//,
			// [1,1,0], // Dont need the last coordinates because the path is closed
		].map(function (coordinateSet) {
			return coordinateSet.map(function (coord, i) {
				return minCoords[i] + coord * size[i] + (coord ? 1 : -1) * haloOffset;
			});
		}), strokeColor, fillColor);
	};

	Renderer.prototype.fillTileHalo = function (tile, strokeColor, fillColor, haloOffset) {
		return this.strokeBoxHalo(
			tile.x,
			tile.y,
			0,
			1,
			1,
			tile.z,
			strokeColor || tile.strokeColor,
			fillColor,
			haloOffset
		);
	};

	 function drawSpatialPolygon (coordinateSets, strokeColor, fillColor) {
		coordinateSets
			.map(function (coords) {
				return this.perspective.pixelForCoordinates(coords[0], coords[1], coords[2]);
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
			this.perspective.pixelForCoordinates(xa, ya, za),
			this.perspective.pixelForCoordinates(xa, ya, za + height),
			this.perspective.pixelForCoordinates(xb, yb, zb + height),
			this.perspective.pixelForCoordinates(xb, yb, zb)
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