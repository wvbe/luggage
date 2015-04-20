define([
	'util',
	'./Tooltip'
], function(
	util,
	Tooltip
) {


	function RandomLanguageTooltip(coordinates, content, options) {
		Tooltip.call(
			this,
			coordinates,
			Array.isArray(content)
				? util.randomFromArray(content)
				: content,
			options
		);

		this.classes.push('language');
	}

	RandomLanguageTooltip.prototype = Object.create(Tooltip.prototype);
	RandomLanguageTooltip.prototype.constructor = RandomLanguageTooltip;

	RandomLanguageTooltip.prototype.createElement = function () {
		var element = Tooltip.prototype.createElement.apply(this, arguments);

		element.innerHTML = this.content;

		return element;
	};

	return RandomLanguageTooltip;
});