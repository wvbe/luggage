define([
	'tiny-emitter'
], function(EventEmitter) {

	function Player(app, tile) {
		EventEmitter.call(this);
		// Player location
		this.tile = tile;
	}

	Player.prototype = Object.create(EventEmitter.prototype);
	Player.prototype.constructor = Player;

	Player.prototype.move = function (world, x, y) {
		var tile = world.tiles.get(this.tile.getIdForCoordinates(this.tile.x + x, this.tile.y + y));

		// If tile does not exist, stop
		if(!tile)
			return;

		// Save as new player location and pan world to it
		this.tile = tile;

		// @TODO: Move this to a callback/even
		this.emit('move', this.tile);
	};

	Player.prototype.setKeyBinds = function (world) {
		document.addEventListener('keydown', function (event) {
			// If not an arrow key, ignore
			if(event.keyCode < 37 || event.keyCode > 40)
				return;

			// Do not scroll page or whatever
			event.preventDefault();

			switch (event.keyCode) {
				case 37: // left
					return this.move(world, -1, 0);
				case 38: // up
					return this.move(world, 0, 1);
				case 39: // right
					return this.move(world, 1, 0);
				case 40: // down
					return this.move(world, 0, -1);
			}
		}.bind(this));
	};


	/**
	 *
	 * @param {Renderer} renderer
	 */
	Player.prototype.render = function (renderer) {
		renderer.setFillColor('#fff');
		var sphereSize = 0.3;
		renderer.fillPerfectCircle(
			0,
			0,
			this.tile.z + sphereSize/2,
			sphereSize
		);
	};

	return Player;
});