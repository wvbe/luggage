define([
], function(
	) {

	function TooltipSlot (id, options, element) {
		this.id = id;
		this.options = options || {};
		this._element = element;

		this._timeout = null;
	}

	TooltipSlot.prototype.close = function () {
		if(!this.isOpen())
			return;

		this._element.removeChild(this.current.getElement());

		this.clearTimeout();

		// @TODO: Remove event listeners

		this.current = null;
	};

	TooltipSlot.prototype.clearTimeout = function () {
		if(this._timeout) {
			clearTimeout(this._timeout);
			this._timeout = null;
		}
	};
	TooltipSlot.prototype.setTimeout = function (time) {
		this._timeout = setTimeout(function () {
			this.close();
		}.bind(this), time);
	};
	TooltipSlot.prototype.open = function (tooltip) {
		if(this.isOpen()) {
			this.close();
		}

		if(tooltip.getTimeout())
			this.setTimeout(tooltip.getTimeout());

		this.current = tooltip;
		this._element.appendChild(this.current.getElement());
	};

	TooltipSlot.prototype.isOpen = function () {
		return !!this.current;
	};

	return TooltipSlot;
});