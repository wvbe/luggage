const COS = Symbol('cos'),
	SIN = Symbol('sin'),
	TAN = Symbol('tan'),
	DIST = Symbol('dist'),
	SIZE_X = Symbol('size x'),
	SIZE_Y = Symbol('size y');

export default class Perspective {
	constructor (degrees, tileSize = 1) {
		this[SIZE_X] = tileSize;
		this[SIZE_Y] = tileSize;

		const radians = degrees * (Math.PI / 180);
		this[COS] = Math.cos(radians);
		this[SIN] = Math.sin(radians);
		this[TAN] = Math.tan(radians);
		this[DIST] = Math.sqrt(Math.pow(this[COS], 2) + Math.pow(this[SIN], 2)); // pythagoras
	}

	toPixels (worldCoords) {
		const cartesianX = (worldCoords[1] - worldCoords[0]) * -this[COS],
			cartesianY = (worldCoords[0] + worldCoords[1]) * -this[SIN];

		return [
			cartesianX * this[SIZE_X], // x
			cartesianY * this[SIZE_X] - this[SIZE_Y] * worldCoords[2] // y
		];
	}

	toCoordinates (pixelCoords) {
		const isoY = -(this[TAN] * pixelCoords[0] + pixelCoords[1]),
			isoX = (pixelCoords[1] + isoY) / -this[SIN] + isoY;

		return [
			isoX / this[SIZE_X],
			isoY / this[SIZE_X], // @TODO: Should be SIZE_Y?
			0
		];
	}
}
