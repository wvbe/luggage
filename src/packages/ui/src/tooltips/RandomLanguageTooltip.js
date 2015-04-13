define([
	'util',
	'./Tooltip'
], function(
	util,
	Tooltip
) {


	function RandomLanguageTooltip(content, options) {
		Tooltip.call(
			this,
			Array.isArray(content)
				? util.randomFromArray(content)
				: content,
			options
		);
	}

	RandomLanguageTooltip.prototype = Object.create(Tooltip.prototype);
	RandomLanguageTooltip.prototype.constructor = RandomLanguageTooltip;

	RandomLanguageTooltip.prototype.createElement = function () {
		var element = Tooltip.prototype.createElement.apply(this, arguments);

		return element;
	};

	return RandomLanguageTooltip;
});