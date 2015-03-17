define([
], function(
) {

	var MINIMAP_ZOOM = 1;

	/**
	 *
	 * @todo make on() and off() methods
	 * @todo share coordinate sets but not drawing/clearing methods between canvases
	 * @param canvasElement
	 * @constructor
	 */
	function Minimap(canvasElement, world, player) {
		this.canvas = canvasElement;

		this.world = world;
		this.player = player;

		if(canvasElement.localName === 'canvas')
			this.context = this.canvas.getContext('2d');

		//window.addEventListener('resize', this.resize.bind(this));
	}

	/**
	 * Actually draw stuff (whatever was configured) to the canvas
	 * @returns {Minimap}
	 */
	Minimap.prototype.render = function () {
		if(!(typeof this._render === 'function'))
			return this;

		this.clear();

		this._render(this);

		return this;
	};

	/**
	 * Update the canvas after the dimensions might've changed
	 * @returns {Minimap}
	 */
	Minimap.prototype.resize = function () {
		var bb = this.canvas.getBoundingClientRect(),
			newWidth = parseInt(bb.width),
			newHeight = parseInt(bb.height);

		if(this.canvas.width === newWidth && this.canvas.height === newHeight)
			return this;

		this.canvas.width = newWidth/4;
		this.canvas.height = newHeight/4;
//
//		this.context.shadowColor = 'rgb(20, 41, 20)';
//		this.context.shadowOffsetY = 6;

		if(typeof this.render === 'function')
			this.render();

		return this;
	};

	/**
	 * Wipe all that was rendered
	 * @returns {Minimap}
	 */
	Minimap.prototype.clear = function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		return this;
	};


	/**
	 * Transform virtual coordinates to an X and Y
	 * @param x
	 * @param y
	 * @param z
	 * @param omitOffset
	 * @returns {*[]}
	 */
	Minimap.prototype.pixelForCoordinates = function (x, y, z) {
		return [
				x * MINIMAP_ZOOM + this.canvas.width/2,
				y * MINIMAP_ZOOM + this.canvas.height/2
		];
	};

	Minimap.prototype._render = function () {
		var tiles = this.world.list(),
			context = this.context,
			id = context.getImageData(0, 0, 1, 1);


		tiles.forEach(function (tile) {
			var drawCoordinates = this.pixelForCoordinates(tile.x, tile.y, tile.z),
				rgbColor = tile.fillColor.toRGB();

			id.data[0] = Math.round(rgbColor.red * 255);
			id.data[1] = Math.round(rgbColor.green * 255);
			id.data[2] = Math.round(rgbColor.blue * 255);
			id.data[3] = Math.round(rgbColor.alpha * 255);

			context.putImageData(
				id,
				drawCoordinates[0],
				drawCoordinates[1]
			);
		}.bind(this));

	};



	return Minimap;
});