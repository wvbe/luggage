define([], function () {

	function JsonObjectDump(element, value) {
		this.element = element;
		if(value === undefined)
			return;

		this.value = value;
		this.update(value);
	}
	JsonObjectDump.prototype.update = function (value) {
		value = value === undefined ? this.value: value;
		value = typeof value === 'function' ? value() : value;
		try {
			value = JSON.stringify(value, null, '    ');
		} catch(e) {
			value = '- Could not be stringified -';
		}
		this.element.innerHTML = value;
	};

	return JsonObjectDump;
});