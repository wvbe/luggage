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

	PlayerEntity.prototype.render = function (renderer) {
		Entity.prototype.render.apply(this, arguments);

		if(this.path && this.path.length >= 2) {
			renderer.context.lineWidth = 3;
			renderer.strokeSpatialBezier([this.tile].concat(this.path).map(function (tile) {
					return [tile.x + 0.5, tile.y + 0.5, tile.z];
				}),
				new Color('yellow').setAlpha(0.7)
			);
			renderer.context.lineWidth = 1;
		}
	}
	return PlayerEntity;
});