const EVENTS = [];
export default class EventEmitter {
	constructor () {
		this[EVENTS] = {};
	}

	on (event, callback) {
		if (!this[EVENTS][event]) {
			this[EVENTS][event] = [];
		}

		this[EVENTS][event].push(callback);

		return () => this[EVENTS][event].splice(this[EVENTS][event].indexOf(callback), 1);
	}

	emit (event, ...args) {
		if (!this[EVENTS][event]) {
			return;
		}
		this[EVENTS][event].forEach(callback => callback(...args));
	}
}
