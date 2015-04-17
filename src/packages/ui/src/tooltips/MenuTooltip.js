define([
	'util',
	'./Tooltip'
], function(
	util,
	Tooltip
) {

	function MenuTooltip(coordinates, content, options) {
		Tooltip.call(
			this,
			coordinates,
			content,
			options
		);
	}

	MenuTooltip.prototype = Object.create(Tooltip.prototype);
	MenuTooltip.prototype.constructor = MenuTooltip;

	MenuTooltip.prototype.createElement = function () {
		var element = Tooltip.prototype.createElement.apply(this, arguments);

		this.content.forEach(function (menuItem) {
			element.appendChild(menuItem.createElement());
		});

		return element;
	};

	return MenuTooltip;
});