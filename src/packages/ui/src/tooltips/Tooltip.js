define([], function(
	EventEmitter,
	ObjectStore
	) {


	function Tooltip(coordinates, content, options) {
		this.coordinates = coordinates;
		this.content = content;
		this.options = options || {};
		this.classes = [
			'tooltip'
		];

		if(this.options.classes) {
			this.classes.concat(this.options.classes);
		}
	}

	Tooltip.prototype.open = function () {

	};

	Tooltip.prototype.close = function () {

	};

	Tooltip.prototype.getElement = function () {
		return this._element;
	};

	Tooltip.prototype.createElement = function () {
		var element = document.createElement('div');

		this.classes.forEach(function (className) {
			element.classList.add(className);
		});

		return element;
	};

	Tooltip.prototype.getOrCreateElement = function () {
		return this.getElement() || this.createElement();
	};
	Tooltip.prototype.getElement = function () {
		if(!this._element) {
			this._element = this.createElement();
		}
		return this._element;
	};

	Tooltip.prototype.getTimeout = function () {
		return this.options.timeout || 0;
	};

	return Tooltip;
});