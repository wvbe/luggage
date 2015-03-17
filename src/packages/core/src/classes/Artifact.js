define([
], function() {

	/**
	 * The character our gamer has control over. While the animations may be missing, the player can move through the
	 * world already.
	 * @param tile
	 * @constructor
	 */
	function Artifact(tile, options) {
	}

//	Artifact.prototype = Object.create(EventEmitter.prototype);
//	Artifact.prototype.constructor = Artifact;

	Artifact.prototype.getMenuItems = function (renderer, tile) {
		return [];
	};

	Artifact.prototype.isWalkable = function () {
		return true;
	};


	Artifact.prototype.render = function (renderer, tile) {
		throw new Error('Not implemented');
	};

	return Artifact;
});