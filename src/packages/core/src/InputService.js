define([
	'tiny-emitter',
	'util'
], function (
	EventEmitter,
	util
) {

	// Event methods that are called if configured so
	var EVENT_METHODS = [
		'preventDefault',
		'stopPropagation',
		'stopImmediagePropagation'
	];

	function InputService() {
		EventEmitter.call(this);

		this.listeners = {};
		this.pressed = {};
	}

	InputService.prototype = Object.create(EventEmitter.prototype);
	InputService.prototype.constructor = InputService;

	InputService.prototype.listen = function () {
		document.addEventListener('keydown', function (event) {
			var keyCode = event.keyCode,
				listener = this.listeners[keyCode];

			if(this.pressed[keyCode])
				return;

			this.pressed[keyCode] = true;

			if(!listener)
				return;

			listener._handler();

			EVENT_METHODS.forEach(function (method) {
				if(listener.options[method])
					event[method]();
			});
		}.bind(this));

		document.addEventListener('keyup', function (event) {
			var keyCode = event.keyCode,
				listener = this.listeners[keyCode];

			this.pressed[keyCode] = false;

			if(!listener)
				return;

			this.emit('keyup', listener);
		}.bind(this));

		return this;
	};

	InputService.prototype.retry = function (keyCode) {
		var listener = this.listeners[keyCode];

		if(!listener || !this.pressed[keyCode])
			return;

		listener._handler();

	};

	/**
	 *
	 * @param keyCode
	 * @param options.debounceTime
	 * @param options.preventDefault
	 * @param options.stopPropagation
	 * @param options.stopImmediatePropagation
	 * @param callback
	 */
	InputService.prototype.configureKey = function (keyCode, options, callback) {
		if(!options)
			options = {};

		var listener = {
				keyCode: keyCode,
				options: options
			},
			handler = function () {
				this.emit('keydown:' + keyCode, listener);
				if(typeof callback === 'function')
					callback(listener);
			}.bind(this);

		if(options.debounceTime)
			listener._handler = this.createKeyDebounceHandler(keyCode, options, handler);
		else if(options.intervalTime)
			listener._handler = this.createKeyIntervalHandler(keyCode, options, handler);
		else
			listener._handler = handler;

		this.listeners[keyCode] = listener;

		return this;
	};

	InputService.prototype.createKeyDebounceHandler = function (keyCode, options, handler) {
		return util.debounce(handler, options.debounceTime, true);
	};

	var KEY_INTERVALS = {};

	/**
	 *
	 * @param keyCode
	 * @param options
	 * @param handler
	 * @returns {Function}
	 */
	InputService.prototype.createKeyIntervalHandler = function (keyCode, options, handler) {
		var destroyInterval = function () {
				clearInterval(KEY_INTERVALS[keyCode]);
				KEY_INTERVALS[keyCode] = null;
			},
			createInterval = function () {
				KEY_INTERVALS[keyCode] = setInterval(function () {
					if(this.pressed[keyCode])
						handler();
					else
						destroyInterval();
				}.bind(this), options.intervalTime || 100);
			}.bind(this);

		return function () {
			if(KEY_INTERVALS[keyCode])
				return;

			handler();
			createInterval();
		};
	};

	return InputService;
});