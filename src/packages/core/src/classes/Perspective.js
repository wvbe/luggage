define([
	'tiny-emitter',
], function(
	EventEmitter
) {

	function Perspective(element, tileSize, isometricAngle) {
		EventEmitter.call(this);

		this.setTileSize(tileSize || 32);
		this.setIsometricAngle(isometricAngle || 30);
		this.setOffset(0, 0);

		this.updateSizeForElement(element);
		window.addEventListener('resize', function () {
			this.updateSizeForElement(element);
		}.bind(this));
	}

	Perspective.prototype = Object.create(EventEmitter.prototype);
	Perspective.prototype.constructor = Perspective;

	/**
	 * Get the pixel length of one virtual unit of measurement, the absolute zoom value
	 * @returns {number}
	 */
	Perspective.prototype.getTileSize = function () {
		return this.tileSize;
	};

	/**resize
	 * Set the pixel length of a virtual unit of measurement, the absolute zoom value
	 * @param tileSize
	 * @returns {Perspective}
	 */
	Perspective.prototype.setTileSize = function (tileSize) {
		this.tileSize = tileSize;
		this.tileHeight = tileSize/6;

		return this;
	};

	Perspective.prototype.setIsometricAngle = function (degrees) {
		this.isometricAngle = degrees * (Math.PI / 180);
		this._isometricCos = Math.cos(this.isometricAngle);
		this._isometricSin = Math.sin(this.isometricAngle);
		this._isometricTan = Math.tan(this.isometricAngle);
		this._isometricDist = Math.sqrt(this._isometricCos*this._isometricCos + this._isometricSin*this._isometricSin); // the length of a diagonal, in pixels

		return this;
	};

	/**
	 * Pan render camera to pixel values
	 * @param {Number} x
	 * @param {Number} y
	 */
	Perspective.prototype.setOffset = function (x, y) {
		this.offset = {
			x: x,
			y: y
		};
		return this;
	};
	Perspective.prototype.updateSizeForElement = function (element) {
			var bb = element.getBoundingClientRect(),
				size = {
					x: parseInt(bb.width),
					y: parseInt(bb.height)
				},
				changed = (!this.size || size.x !== this.size.x || size.y !== this.size.y);

		this.size = size;

		if(changed)
			this.emit('resize', this);

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
	Perspective.prototype.pixelForCoordinates = function (x, y, z, omitOffset) {
		var cartX = (x + y) * this._isometricCos,
			cartY = (x - y) * this._isometricSin;

		return [
			(omitOffset ? 0 : this.offset.x + 0.5 * this.size.x)  + cartX * this.tileSize, // x
			(omitOffset ? 0 : this.offset.y + 0.5 * this.size.y) + cartY * this.tileSize - this.tileHeight * z // y
		];
	};

	Perspective.prototype.coordinatesForPixel = function (cartX, cartY, omitOffset) {
		// assuming y = ax + b
		cartX = cartX  - 0.5 * this.size.x  - (omitOffset ? 0 : this.offset.x);
		cartY = -cartY + 0.5 * this.size.y + (omitOffset ? 0 : this.offset.y);

		var isoY = (this._isometricTan * cartX + cartY),
			isoX = (cartY - isoY) / -this._isometricSin - isoY;

		// this is good so far, b should be rescaled for tile size. as
		return [
			isoX / this.tileSize,
			isoY / this.tileSize
		];
	};

	return Perspective;
});