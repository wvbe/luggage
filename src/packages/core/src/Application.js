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

		// @TODO: Remove direct reference to a canvas element here
		this.renderer = new Renderer(document.getElementById('world'), function () {
			var closestTiles = this.maintainTilesAroundPlayer();
			this.renderer.renderTiles(closestTiles);
			//this.renderer.renderTiles(this.world.tiles.list());
		}.bind(this));

		// @TODO: Remove direct reference to a canvas element here
		this.cursor = new Renderer(document.getElementById('player'), function () {
			this.player.render(this.cursor);
		}.bind(this));

		this.messenger = new ui.NotificationService();

		/**
		 * Describes the playable environment: tiles, distances, areas
		 * @type {World}
		 */
		// @TODO must absolutely clean this up
		this.world = new World(this);

		var worldTiles = this.world.tiles;
		this.world.generateTilesOnPositions(this.world.getPotentialTilesAroundPosition({x: 0, y: 0}, FOG_OF_WAR_DISTANCE));

		/**
		 * Describes this machine's interaction with his/her character in the game world: move
		 * Future: interact, say
		 * @event move (tile)
		 * @type {Player}
		 */
		this.player = new Player(
			this, // Pass the app
			this.world.getSpawnTile() // Specify location of the player
		);

		this.maintainTilesAroundPlayer();
		this.maintainTilesAroundPlayer();
		this.maintainTilesAroundPlayer();
		this.maintainTilesAroundPlayer();
		this.maintainTilesAroundPlayer();
		this.maintainTilesAroundPlayer();
		this.maintainTilesAroundPlayer();
		this.maintainTilesAroundPlayer();
		this.maintainTilesAroundPlayer();
		this.maintainTilesAroundPlayer();

		// Binds keyboard input to interaction with the world
		this.player.setKeyBinds(this.world);

		// @TODO must absolutely clean this up
		// Does parallax scrolling on the viewport
		this.backdrop = document.getElementById('backdrop');
		var moves = 0,
			panMoveDelay = 1;

		this.player.on('move', function (tile) {
			this.renderer.panViewportToTile(tile.x, tile.y, 0);
			this.renderer.panToTile(tile.x, tile.y, 0);

			// redraw all the things
			this.renderer.clear();
			this.renderer.render();
			this.cursor.clear();
			this.cursor.render();

			var bgPos = this.renderer.pixelForCoordinates(
					tile.x * PARALLAX_MODIFIER,
					tile.y * PARALLAX_MODIFIER,
					tile.z * PARALLAX_MODIFIER,
					true
				);
			this.backdrop.setAttribute('style', 'background-position: ' + bgPos[0] +'px ' + bgPos[1] + 'px;');


			++moves;
		}.bind(this));


		/**
		 * Describes UI behaviour. Doesn't have much to do with the game in itself
		 * @type {Ui}
		 */

		this.ui = {
			currentTile: new ui.JsonObjectDump(
				document.getElementById('dump-current-tile'),
				this.getPlayerLocation()
			)
		};
		this.player.on('move', this.ui.currentTile.update.bind(this.ui.currentTile));

		// Call the renderer resize fn once, now that we have both app.world and app.player
		// @TODO: Too hacky ~ @EDIT: A little less hacky, still not sure
//		this.renderer.onResize();
//		this.cursor.onResize();


		var bindReset = function () {
			var tile = this.player.tile;
			this.renderer.panToTile(tile.x, tile.y, 0);
			this.cursor.panToTile(tile.x, tile.y, 0);

			this.renderer.panViewportToTile(tile.x, tile.y, 0);
			this.cursor.panViewportToTile(tile.x, tile.y, 0);
		}.bind(this);

		bindReset();

		this.cursor.render();

		// @TODO: Do this way more nicely, bitch
		// Zooms the viewport in and out on mousewheel action
		document.body.addEventListener('mousewheel', function (e) {
			this.renderer.setTileSize(Math.abs(this.renderer.getTileSize() * (e.wheelDelta < 0 ? SCROLL_ZOOM_SPEED : 1/SCROLL_ZOOM_SPEED)))
			this.renderer.clear();
			this.renderer.render();
			this.cursor.clear();
			this.cursor.render();
		}.bind(this));

	}

	Application.prototype.getPlayerLocation = function () {
		return this.player.tile;
	};

	Application.prototype.generateTilesOnUnsaturatedEdges = function generateTilesOnUnsaturatedEdges(iterations) {
		iterations = iterations === undefined
			? 1
			: parseInt(iterations || 0);
		console.time(arguments.callee.name);
		for(var i = 0; i < iterations; ++i) {
			this.world.generateNewTiles();
		}
		console.timeEnd(arguments.callee.name);
	};

	Application.prototype.maintainTilesAroundPlayer = function () {

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

	return Application;
});