define([
	'util',
	'language',

	'./Tooltip'
], function(
	util,
	language,

	Tooltip
) {


	function RandomLanguageTooltip(coordinates, content, options) {


		Tooltip.call(
			this,
			coordinates,
			language.player.get(content) || content,
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