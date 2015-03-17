define([], function() {


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

	/**
	 * Simply replace the prototype close() with the one provided by a TooltipSlot
	 * @param close
	 */
	Tooltip.prototype.setCloseHandler = function(close) {
		if(typeof close === 'function')
			this.close = close;
		else
			this.close = Tooltip.prototype.close;
	};

	/**
	 * Expects to be and/or overridden in an inheriting class, or be provided by the TooltipSlot via setCloseHandler()
	 */
	Tooltip.prototype.close = function () {
		throw new Error('Not implemented');
	};

	Tooltip.prototype.getElement = function () {
		return this._element;
	};

	Tooltip.prototype.createElement = function () {
		var element = document.createElement('div');

		this.classes.forEach(function (className) {
			element.classList.add(className);
		});

		element.addEventListener('mousedown', function (evt) {
			evt.stopPropagation();
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