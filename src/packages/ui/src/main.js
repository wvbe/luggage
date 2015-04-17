define([
	'./TooltipService',
	'./TooltipSlot',

	'./tooltips/Tooltip',
	'./tooltips/MenuTooltip',
	'./tooltips/RandomLanguageTooltip'
], function (
	TooltipService,
	TooltipSlot,

	Tooltip,
	MenuTooltip,
	RandomLanguageTooltip
) {
	return {
		TooltipService: TooltipService,
		TooltipSlot: TooltipSlot,

		Tooltip: Tooltip,
		MenuTooltip: MenuTooltip,
		RandomLanguageTooltip: RandomLanguageTooltip
	}
});