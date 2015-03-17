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

		this._render = null;

		perspective.on('resize', function (persp) {
			this.resize(persp.size.x, persp.size.y);
		}.bind(this));
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
	Renderer.prototype.resize = function (x, y) {
		this.canvas.width = x;
		this.canvas.height = y;
		this.canvas.style.width = x + 'px';
		this.canvas.style.height = y + 'px';
		this.render();

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
		//this.canvas.style.marginTop = -ABSOLUTE_VIEWPORT_OFFSET.y + 'px';
		//this.canvas.style.marginLeft = -ABSOLUTE_VIEWPORT_OFFSET.x + 'px';

		return this;
	};

	/*
		Get the pixel XY of t+he center of a (tile?) on a given position
	 */
	function normalizeCoords(x,y,z) {
		return typeof x === 'object' && !!x
			? this.perspective.pixelForCoordinates(
				x.x,
				x.y,
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
	Renderer.prototype.panViewportToTile = function (x, y, z, xTransform, yTransform) {
		var coords = normalizeCoords.apply(this, arguments);

		return this.setViewportOffset(
			coords[0] + (xTransform || 0),
			coords[1] + (yTransform || 0)
		);
	};

	return Renderer;
});