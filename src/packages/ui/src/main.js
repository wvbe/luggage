define([
	'./Flag',

	'./TooltipService',
	'./TooltipSlot',

	'./tooltips/Tooltip',
	'./tooltips/HtmlTooltip',
	'./tooltips/MenuTooltip',
	'./tooltips/RandomLanguageTooltip'
], function (
	Flag,

	TooltipService,
	TooltipSlot,

	Tooltip,
	HtmlTooltip,
	MenuTooltip,
	RandomLanguageTooltip
) {
	return {
		Flag: Flag,

		TooltipService: TooltipService,
		TooltipSlot: TooltipSlot,

		Tooltip: Tooltip,
		HtmlTooltip: HtmlTooltip,
		MenuTooltip: MenuTooltip,
		RandomLanguageTooltip: RandomLanguageTooltip
	}
});