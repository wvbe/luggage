const EVENTS = [];

const EVENT_IS_ONCE = Symbol();

export default class Point {
	constructor (x, y, z = 0) {
		this[0] = x;
		this[1] = y;
		this[2] = z;
		this.length = 3;
	}
	distanceTo (point) {
		return Math.sqrt(Math.pow(this[0] - point[0], 2) + Math.pow(this[1] - point[1], 2));// + Math.pow(this[2] - point[2], 2))
	}
	map (cb) {
		return [this[0], this[1], this[2]].map(cb);
	}
	forEach (cb) {
		return [this[0], this[1], this[2]].forEach(cb);
	}
	subtract (point) {
		return this.map((val, i) => val - point[i]);
	}
	add (point) {
		return this.map((val, i) => val + point[i]);
	}
	multiply (point) {
		return this.map((val, i) => val * point[i]);
	}
}
