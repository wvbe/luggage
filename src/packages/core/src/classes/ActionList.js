define([
], function(Color, EventEmitter, language, Path) {

	function ActionList (items) {
		if(!items)
			items = [];
		this.steps = Array.isArray(items) ? items : [items];
	}

	ActionList.prototype.start = function () {
		if(!this.steps.length)
			this.finish();
	};
	ActionList.prototype.forget = function () {
		this.steps = [];
	};
});