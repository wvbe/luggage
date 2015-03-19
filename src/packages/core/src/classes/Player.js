define([
	'tiny-emitter',
	'language'
], function(EventEmitter, language) {

	function Player(app, tile) {
		EventEmitter.call(this);
		// Player location
		this.tile = tile;
		this.channel = app.messenger.create('player-channel')
			.bindToListElement(document.getElementById('messenger'));
	}

	Player.prototype = Object.create(EventEmitter.prototype);
	Player.prototype.constructor = Player;

	Player.prototype.move = function (world, x, y) {
		var tile = world.tiles.get(this.tile.getIdForCoordinates(this.tile.x + x, this.tile.y + y));

		// If tile does not exist, stop
		if(!tile) {
			this.yikes(language.player.CANNOT_MOVE__EMPTY_TILE);
			return;
		}

		var dz = tile.z - this.tile.z;
		if(dz > 2) {
			this.hmm(language.player.CANNOT_MOVE__TOO_STEEP_UP, tile.z - this.tile.z);
			return;
		}

		if(dz < -2) {
			this.doh(language.player.CANNOT_MOVE__TOO_STEEP_DOWN,  Math.abs(tile.z - this.tile.z));
			return;
		}

		// Save as new player location and pan world to it
		this.tile = tile;

		// @TODO: Move this to a callback/even
		this.emit('move', this.tile);
	};

	Player.prototype.doh = function (message) {
		this.channel.logMessageOfType('doh', message);
	};

	Player.prototype.hmm = function (message) {
		this.channel.logMessageOfType('hmm', message);
	};

	Player.prototype.yikes = function (message) {
		this.channel.logMessageOfType('yikes', message);
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
		var sphereRadius = 0.15;
		renderer.fillPerfectCircle(
			0, // Positioned on the middle...
			0, // ... of the x and y of tile
			this.tile.z + sphereRadius, // Center is on same tile z + it's own radius
			sphereRadius
		);
	};

	return Player;
});