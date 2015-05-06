define([
	'./Generator'
], function(Generator) {

	/**
	 * The character our gamer has control over. While the animations may be missing, the player can move through the
	 * world already.
	 * @param tile
	 * @constructor
	 */
	function ForgetfulGenerator(player, world) {
		Generator.call(this, player, world);

		player.on('move', function () {
			this.groomTerrain()
		})
	}

	ForgetfulGenerator.prototype = Object.create(Generator.prototype);
	ForgetfulGenerator.prototype.constructor = ForgetfulGenerator;

	ForgetfulGenerator.prototype.groomTerrain = function (TileClass, tileRegistry) {

	};

	return ForgetfulGenerator;
});