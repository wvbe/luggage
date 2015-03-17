define([
], function(
) {


	// @TODO: Pannable viewport & shit
	var TILE_SIZE = 24;

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

		if(typeof this.render === 'function')
			this.render();
	};
	Renderer.prototype.clear = function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	};

	Renderer.prototype.setOffset = function (x, y) {
		this.offset = {
			x: x,
			y: y
		}
	};

	Renderer.prototype.pixelForCoordinates = function (x, y, z, omitOffset) {
		return [
			(omitOffset ? 0 : this.offset.x + 0.5 * this.canvas.width) + (x + ISOMETRIC_Y_TO_X_OFFSET * y) * TILE_SIZE,
			(omitOffset ? 0 : this.offset.y + 0.5 * this.canvas.height) - (y * ISOMETRIC_Y_TO_X_RATIO + z * ISOMETRIC_Z_TO_X_RATIO) * TILE_SIZE
		];
	};

	Renderer.prototype.fillFlatPlane = function (x, y, z, width, height) {
		this.context.beginPath();
		[
			this.pixelForCoordinates(x - width/2, y - height/2, z),
			this.pixelForCoordinates(x + width/2, y - height/2, z),
			this.pixelForCoordinates(x + width/2, y + height/2, z),
			this.pixelForCoordinates(x - width/2, y + height/2, z)
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

	function normalizeColorCode (color) {
		if(Array.isArray(color))
			color = 'rgb' + (color.length === 4 ? 'a' : '') + '(' + color.map(function(val, i) { return i < 3 ? Math.round(val) : val; }).join(',') + ')';
		return color;
	}
	return Renderer;
});