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

	function Application() {

		this.World = World;
		this.Tile = Tile;
		this.Renderer = Renderer;
		this.Player = Player;

		this.tooltip = new ui.TooltipService();

		this.world = new World(this);
		this.renderer = new Renderer(document.getElementById('world'))
			.onRender(this.world.renderTiles.bind(this.world));

		this.player = new Player(
			this.world.getSpawnTile(),
			this.tooltip.registerSlot('player', {}, document.getElementById('tooltips'))
		);
		this.cursor = new Renderer(document.getElementById('player'))
			.onRender(this.player.renderCharacter.bind(this.player));

		this.backdrop = document.getElementById('backdrop');
		/*
			Set up render cyles
		 */

		/*
			Generate the initial contents of the world, and iterate it 11 times
		 */
		this.world.generateTilesOnPositions(this.world.getPotentialTilesAroundPosition(this.player.tile, FOG_OF_WAR_DISTANCE));
		for(var i = 0, max = 11, center = this.player.tile; i < max; ++i)
			this.iterateTerrain(center);

		this.player.setKeyBinds(this.world);

		this.player.on('move', function (tile) {
			this.iterateTerrain(tile);

			this.focusOnTile(tile);

			var bgPos = this.renderer.pixelForCoordinates(
					tile.x * PARALLAX_MODIFIER,
					tile.y * PARALLAX_MODIFIER,
					tile.z * PARALLAX_MODIFIER,
					true
				);
			this.backdrop.setAttribute('style', 'background-position: ' + bgPos[0] +'px ' + bgPos[1] + 'px;');
		}.bind(this));

		/*
			No turning back now
		 */
		this.focusOnTile(this.getPlayerLocation());

	}

	Application.prototype.zoom = function (amount, tile) {
		if(amount === undefined)
			amount = true;

		if(amount === !!amount)
			amount = this.renderer.getTileSize() * (!amount ? SCROLL_ZOOM_SPEED : 1/SCROLL_ZOOM_SPEED)

		if(!amount)
			amount = 1;

		this.renderer.setTileSize(Math.abs(amount));

		this.focusOnTile(tile || this.getPlayerLocation());
	};

	Application.prototype.focusOnTile = function (tile) {
		if(!tile) {
			console.log('Tile does not exist');
			return;
		}

		this.renderer
			.panViewportToTile(tile.x, tile.y, 0)
			.panToTile(tile.x, tile.y, 0)
			.clear()
			.render();
		this.cursor
			.panToTile(tile.x, tile.y, 0)
			.clear()
			.render();
	};

	Application.prototype.getPlayerLocation = function () {
		return this.player.tile;
	};

	Application.prototype.iterateTerrain = function (playerLocation) {

		var registry = this.world.tiles,

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
	};

	return Application;
});