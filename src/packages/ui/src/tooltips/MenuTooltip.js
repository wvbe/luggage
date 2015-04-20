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

		this.classes.push('menu');
	}

	MenuTooltip.prototype = Object.create(Tooltip.prototype);
	MenuTooltip.prototype.constructor = MenuTooltip;

	MenuTooltip.prototype.createElement = function () {
		var element = Tooltip.prototype.createElement.apply(this, arguments);

		this.content.forEach(function (menuItem) {
			var itemElement = menuItem.createElement();
			itemElement.classList.add('tooltip__item');
			element.appendChild(itemElement);
		});

		return element;
	};

	return MenuTooltip;
});