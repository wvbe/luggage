define([], function(
	EventEmitter,
	ObjectStore
	) {


	function Tooltip(content, options) {
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

	Tooltip.prototype.createElement = function () {
		var element = document.createElement('div');

		this.classes.forEach(function (className) {
			element.classList.add(className);
		});

		element.innerHTML = this.content;

		return element;
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