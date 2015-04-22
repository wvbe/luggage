define([
	'Color',
	'./Entity'
], function(Color, Entity) {

	/**
	 * The character our gamer has control over. While the animations may be missing, the player can move through the
	 * world already.
	 * @param tile
	 * @constructor
	 */
	function PlayerEntity(tile, options) {
		Entity.call(this, tile, options);

		// Some presentation stuffs
		this.fillColor = new Color([255, 255, 255]);
		this.strokeColor = new Color([50,50,50]);
	}

	PlayerEntity.prototype = Object.create(Entity.prototype);
	PlayerEntity.prototype.constructor = PlayerEntity;

	return PlayerEntity;
});