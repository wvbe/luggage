define([
	'./Renderer'
], function(
	Renderer
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
	function CanvasRenderer(perspective, canvasElement) {
		Renderer.call(this, perspective, canvasElement);

		if(canvasElement.localName === 'canvas')
			this.context = this.canvas.getContext('2d');
	}

	CanvasRenderer.prototype = Object.create(Renderer.prototype);
	CanvasRenderer.prototype.constructor = CanvasRenderer;

	/**
	 * Wipe all that was rendered
	 * @returns {CanvasRenderer}
	 */
	CanvasRenderer.prototype.clear = function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		return this;
	};

	/*
	 * Close and fill/stroke the last shape that was drawn
	 * @param strokeColor
	 * @param fillColor
	 * @returns {CanvasRenderer}
	 */
	CanvasRenderer.prototype.finishLastShape = function (strokeColor, fillColor) {
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
	 * @returns {CanvasRenderer}
	 */
	CanvasRenderer.prototype.fillPerfectCircle = function (x, y, z, radius, strokeColor, fillColor) {
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
	 * @returns {CanvasRenderer}
	 */
	CanvasRenderer.prototype.fillSpatialPolygon = function (coordinateSets, strokeColor, fillColor) {
		this.context.beginPath();
		drawSpatialPolygon.call(this, coordinateSets);
		this.context.closePath();
		return this.finishLastShape(strokeColor, fillColor);
	};

	CanvasRenderer.prototype.strokeSpatialLines = function (coordinateSets, strokeColor, fillColor) {
		this.context.beginPath();
		drawSpatialPolygon.call(this, coordinateSets);
		return this.finishLastShape(strokeColor, fillColor);
	};

	CanvasRenderer.prototype.strokeSpatialBezier = function (coordinateSets, strokeColor, fillColor) {
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
	CanvasRenderer.prototype.strokeBoxHalo = function (x, y, z, width, length, height, strokeColor, fillColor, haloOffset) {
		var minCoords = [x,y,z],
			size = [width, length, height];
		var haloOffset = haloOffset || 0;
		return this.fillSpatialPolygon([
			[1,1,0],
			[1,1,1],
			[0,1,1],
			[0,0,1],
			[0,0,0],
			[1,0,0]//,
			// [1,1,0], // Dont need the last coordinates because the path is closed
		].map(function (coordinateSet) {
			var xy = coordinateSet.map(function (coord, i) {
				return minCoords[i] + coord * size[i] + (coord ? 1 : -1) * haloOffset;
			});
			return xy;
		}), strokeColor, fillColor);
	};

	CanvasRenderer.prototype.fillTileHalo = function (tile, strokeColor, fillColor, haloOffset) {
		return this.strokeBoxHalo(
			tile.x,
			tile.y,
			0,
			1,
			1,
			tile.z,
			strokeColor,
			fillColor,
			haloOffset
		);
	};

	 function drawSpatialPolygon (coordinateSets) {
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
	 * @returns {CanvasRenderer}
	 */
	CanvasRenderer.prototype.fillFlatPlane = function (x, y, z, width, height, strokeColor, fillColor) {
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
	CanvasRenderer.prototype.fillVerticalPlane = function (xa, ya, za, xb, yb, zb, height, strokeColor, fillColor) {

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
	CanvasRenderer.prototype.fillEastToWestPlane = function (x, y, z, length, height, strokeColor, fillColor) {
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
	CanvasRenderer.prototype.fillNorthToSouthPlane = function (x, y, z, length, height, strokeColor, fillColor) {
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
	 * @returns {CanvasRenderer}
	 */
	CanvasRenderer.prototype.fillBox = function (x, y, z, width, length, height, strokeColor, fillColor) {
		return this
			.fillEastToWestPlane(x, y, z, width, height, strokeColor, fillColor ? fillColor.darkenByRatio(0.1) : fillColor)
			.fillNorthToSouthPlane(x + width, y, z, length, height, strokeColor, fillColor ? fillColor.darkenByRatio(0.2) : fillColor)
			.fillFlatPlane(x, y, z + height, width, length, strokeColor, fillColor);
	};


	/**
	 * Set a fill color for the next shape that is drawn
	 * @todo deprecate
	 * @param color
	 * @returns {CanvasRenderer}
	 */
	CanvasRenderer.prototype.setFillColor = function(color) {
		this.context.fillStyle = color.toString();

		return this;
	};

	/**
	 * Set a stroke color for the next shape that is drawn
	 * @todo deprecate
	 * @param color
	 * @returns {CanvasRenderer}
	 */
	CanvasRenderer.prototype.setStrokeColor = function(color) {
		this.context.strokeStyle = color.toString();

		return this;
	};

	return CanvasRenderer;
});