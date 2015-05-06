define([
], function() {

	/**
	 * The character our gamer has control over. While the animations may be missing, the player can move through the
	 * world already.
	 * @constructor
	 */
	function MenuItem(label, callback) {
		this.label = label;
		this._callback = callback;
	}

	MenuItem.prototype.execute = function () {
		if(typeof this._callback === 'function')
			this._callback();
	};

	MenuItem.prototype.createElement = function () {
		var element = document.createElement('a');
		element.appendChild(document.createTextNode(this.label));

		element.addEventListener('mouseup', function () {
			this.execute();
		}.bind(this));

		return element;
	};

	return MenuItem;
});