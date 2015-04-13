define([
	'ui',
	'Color',
	'./classes/World',
	'./classes/Tile',
	'./classes/Renderer',
	'./classes/Player'
], function (
	ui,
	Color,

	World,
	Tile,
	Renderer,
	Player
) {
	var PARALLAX_MODIFIER = -0.1,
		SCROLL_ZOOM_SPEED = 0.8,
		FOG_OF_WAR_DISTANCE = 16;

	function InputManager() {

	}

	InputManager.prototype.while = function (key, callback) {

	};

	InputManager.prototype.generateTilesOnUnsaturatedEdges = function generateTilesOnUnsaturatedEdges(iterations) {
		iterations = iterations === undefined
			? 1
			: parseInt(iterations || 0);
		console.time(arguments.callee.name);
		for(var i = 0; i < iterations; ++i) {
			this.world.generateNewTiles();
		}
		console.timeEnd(arguments.callee.name);
	};

	InputManager.prototype.maintainTilesAroundPlayer = function () {

		var registry = this.world.tiles,
			playerLocation = this.player.tile,

			tileRanges = this.world.getTilesWithinRanges(playerLocation, [
				FOG_OF_WAR_DISTANCE + 1,
				// outOfRangeTiles, delete
				FOG_OF_WAR_DISTANCE,
				// couldBeAnyTiles, remux
			], true, true),

			outOfRangeTiles = tileRanges[0],
			couldBeAnyTiles = tileRanges[1],

			regeneratableTiles = couldBeAnyTiles
				.filter(function (tile) {
					return (tile instanceof Tile) && tile.canStillBeChanged();
				});

		var newTiles = this.world.generateTilesOnPositions(couldBeAnyTiles.filter(function (tile) {
			return !(tile instanceof Tile);
		}));

		this.world.relaxTiles(regeneratableTiles.concat(newTiles), 0.03, true);

		outOfRangeTiles.forEach(function (tile) {
			if(!(tile instanceof Tile))
				return;
			registry.delete(tile.x + ',' + tile.y);
		}.bind(this));

		return registry.list();
		//return actuallyRendereredTiles;
	};

	return InputManager;
});