define([
	'./Flag',

	'./TooltipService',
	'./TooltipSlot',

	'./tooltips/Tooltip',
	'./tooltips/MenuTooltip',
	'./tooltips/RandomLanguageTooltip'
], function (
	Flag,

	TooltipService,
	TooltipSlot,

	Tooltip,
	MenuTooltip,
	RandomLanguageTooltip
) {
	return {
		Flag: Flag,

		TooltipService: TooltipService,
		TooltipSlot: TooltipSlot,

		Tooltip: Tooltip,
		MenuTooltip: MenuTooltip,
		RandomLanguageTooltip: RandomLanguageTooltip
	}
});