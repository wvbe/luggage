define([
	'Color',
	'tiny-emitter',
	'language',

	'./Entity'
], function(Color, EventEmitter, language, Entity) {

	/**
	 * The character our gamer has control over. While the animations may be missing, the player can move through the
	 * world already.
	 * @param tile
	 * @constructor
	 */
	function Player(tile, options) {
		Entity.call(this, tile, options);

		// Some presentation stuffs
		this.fillColor = new Color([255, 255, 255]);
		this.strokeColor = new Color([50,50,50]);
	}

	Player.prototype = Object.create(Entity.prototype);
	Player.prototype.constructor = Player;

	return Entity;
});