define([
	'Color',
	'util',

	'./Entity'
], function(Color, util, Entity) {

	/**
	 * The character our gamer has control over. While the animations may be missing, the player can move through the
	 * world already.
	 * @param tile
	 * @constructor
	 */
	function NpcEntity(tile, options, properties) {
		Entity.call(this, tile, options);

		this.options = {
			moveInterval: 100
		};

		this.properties = properties;

		this.active = false;

		// Some presentation stuffs
		this.fillColor = new Color([0,0,0]);
		this.strokeColor = new Color([255,255,255]);
	}

	NpcEntity.prototype = Object.create(Entity.prototype);
	NpcEntity.prototype.constructor = NpcEntity;

	NpcEntity.prototype.startRandomMoving = function (world) {
		this.active = true;

		this.keepMakingRandomMoves(world);
	};

	NpcEntity.prototype.makeRandomMove = function (world) {
		console.log('Entity making a random move', this.tile);
		var withinRange = world.getTilesWithinRanges(this.tile, [7, 3])[0],
			randomWithinRange = util.randomFromArray(withinRange);
		return this.walkToTile(world, randomWithinRange);
	};

	NpcEntity.prototype.keepMakingRandomMoves = function (world) {
		setTimeout(function () {
			if(!this.active)
				return;

			this.makeRandomMove(world);
			this.once('move:finish', function () {
				this.keepMakingRandomMoves(world);
			}.bind(this))
		}.bind(this), 10 * 1000 * Math.random());
	};

	NpcEntity.prototype.getProperty = function (propertyName) {
		return this.properties[propertyName];
	};

	return NpcEntity;
});