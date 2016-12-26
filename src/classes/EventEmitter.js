const EVENTS = [];

const EVENT_IS_ONCE = Symbol();
export default class EventEmitter {
	constructor () {
		this[EVENTS] = {};
	}

	once (event, callback) {
		callback[EVENT_IS_ONCE] = true;

		return this.on(event, callback);
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
		this[EVENTS][event].forEach(callback => {
			callback(...args);

			if(callback[EVENT_IS_ONCE])
				this[EVENTS][event].splice(this[EVENTS][event].indexOf(callback), 1);
		});
	}
}
