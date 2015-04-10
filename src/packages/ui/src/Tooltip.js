define([], function(
	EventEmitter,
	ObjectStore
	) {


	function Tooltip(content) {
		this.content = content;
	}

	Tooltip.prototype.open = function () {

	};

	Tooltip.prototype.close = function () {

	};

	Tooltip.prototype.createElement = function () {
		var element = document.createElement('div');
		element.innerHTML = this.content;
		return element;
	};

	return Tooltip;
});