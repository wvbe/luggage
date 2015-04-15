define([
	'./TooltipService',
	'./TooltipSlot',

	'./tooltips/Tooltip',
	'./tooltips/RandomLanguageTooltip'
], function (
	TooltipService,
	TooltipSlot,

	Tooltip,
	RandomLanguageTooltip
) {
	return {
		TooltipService: TooltipService,
		TooltipSlot: TooltipSlot,

		Tooltip: Tooltip,
		RandomLanguageTooltip: RandomLanguageTooltip
	}
});