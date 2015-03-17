define([
	'util',
	'language',

	'./Tooltip'
], function(
	util,
	language,

	Tooltip
) {


	function HtmlTooltip(coordinates, content, options) {
		Tooltip.call(
			this,
			coordinates,
			content,
			options
		);

		this.classes.push('html');
	}

	HtmlTooltip.prototype = Object.create(Tooltip.prototype);
	HtmlTooltip.prototype.constructor = HtmlTooltip;

	HtmlTooltip.prototype.createElement = function () {
		var element = Tooltip.prototype.createElement.apply(this, arguments);

		element.innerHTML = this.content;

		return element;
	};

	return HtmlTooltip;
});