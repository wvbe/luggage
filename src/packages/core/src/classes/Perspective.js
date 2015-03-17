define([
	'tiny-emitter',

	'config'
], function(
	EventEmitter,

	config
) {

	function Perspective() {
		EventEmitter.call(this);

		this.tileSize = config.perspective.tileSize || 32;

		this.tileHeight = config.perspective.tileHeight || (this.tileSize / 6);

		this.offset = {
			x: 0,
			y: 0
		};

		this.setIsometricAngle(config.perspective.angle || 30);
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
		var size = {
			x: element[0],
			y: element[1]
		};

		var changed = (!this.size || size.x !== this.size.x || size.y !== this.size.y);

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

	Perspective.prototype.getBoundingBoxForTiles = function (tiles) {
		var minX = null, maxX = null, minY = null, maxY = null;

		tiles.forEach(function (tile) {
			[
				this.pixelForCoordinates(tile.x, tile.y, 0, true),
				this.pixelForCoordinates(tile.x + 1, tile.y, 0, true),
				this.pixelForCoordinates(tile.x, tile.y + 1, 0, true),
				this.pixelForCoordinates(tile.x + 1, tile.y + 1, 0, true)
			].forEach(function (pixels) {
				if(minX === null || pixels[0] < minX)
					minX = pixels[0];
				if(maxX === null || pixels[0] > maxX)
					maxX = pixels[0];

				if(minY === null || pixels[1] < minY)
					minY = pixels[1];
				if(maxY === null || pixels[1] > maxY)
					maxY = pixels[1];
			});
		}.bind(this));

		return [
			maxX - minX,
			maxY - minY
		]
	};

	return Perspective;
});