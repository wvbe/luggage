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
			itemElement.addEventListener('mouseup', function () {
				this.close();
			}.bind(this));
			element.appendChild(itemElement);
		}.bind(this));

		return element;
	};

	return MenuTooltip;
});