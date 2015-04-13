define([
	'./TooltipService',

	'./tooltips/Tooltip',
	'./tooltips/RandomLanguageTooltip'
], function (
	TooltipService,

	Tooltip,
	RandomLanguageTooltip
) {
	return {
		TooltipService: TooltipService,

		Tooltip: Tooltip,
		RandomLanguageTooltip: RandomLanguageTooltip
	}
});