define([
	'./TooltipSlot'
], function(
	TooltipSlot
) {

	function TooltipService() {
		this.slots = {};
	}

	TooltipService.prototype.registerSlot = function (slot, options, element) {
		this.slots[slot] = new TooltipSlot(slot,options, element);

		return this.slots[slot];
	};

	return TooltipService;
});