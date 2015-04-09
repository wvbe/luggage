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
		SCROLL_ZOOM_SPEED = 0.8;

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
		this.world.generateTilesOnPositions(this.world.getPotentialTilesAroundPosition({x: 0, y: 0}, 8));
		this.world.relaxAllTiles( 0.1);
		this.world.relaxAllTiles( 0.1);
		worldTiles.list().forEach(function(tile) {
			tile.updateColorsForRegistry(worldTiles);
		});
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

		// Binds keyboard input to interaction with the world
		this.player.setKeyBinds(this.world);

		// @TODO must absolutely clean this up
		// Does parallax scrolling on the viewport
		var viewportElement = document.getElementById('viewport');
		var moves = 0,
			panMoveDelay = 5;

		this.player.on('move', function (tile) {
			++moves;

//
			if(moves % (panMoveDelay+1) === 0) {
				this.renderer.panViewportToTile(tile.x, tile.y, 0);
				this.cursor.panViewportToTile(tile.x, tile.y, 0);
				this.renderer.panToTile(tile.x, tile.y, 0);
				this.cursor.panToTile(tile.x, tile.y, 0);
			}
//			if(panMoveDelay) {
//			}
//
//			if(!panMoveDelay || moves % (panMoveDelay+1) === 0) {
				this.renderer.clear();
				this.renderer.render();
//			}

			this.cursor.clear();
			this.cursor.render();
			var bgPos = this.renderer.pixelForCoordinates(tile.x * PARALLAX_MODIFIER, tile.y * PARALLAX_MODIFIER, tile.z * PARALLAX_MODIFIER, true);
			viewportElement.setAttribute('style', 'background-position: ' + bgPos[0] +'px ' + bgPos[1] + 'px;');
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
		this.renderer.onResize();
		this.cursor.onResize();


		var bindReset = function () {
			this.renderer.panToTile(this.player.tile.x, this.player.tile.y, 0);
			this.cursor.panToTile(this.player.tile.x, this.player.tile.y, 0);
		}.bind(this);

		bindReset();

		this.cursor.render();

		// @TODO: Do this way more nicely, bitch
		// Zooms the viewport in and out on mousewheel action
		document.body.addEventListener('mousewheel', function (e) {
			window.TILE_SIZE = Math.abs(window.TILE_SIZE * (e.wheelDelta < 0 ? SCROLL_ZOOM_SPEED : 1/SCROLL_ZOOM_SPEED));
			window.TILE_HEIGHT = window.TILE_SIZE/6;
			this.renderer.panToTile(this.player.tile);
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
				12,
				// delete anything between 9 and 8
				11,
				// remux everything between 8 and 7
				8,
				// keep static everything lower than that,
				6
			], true, true),
			outOfRangeTiles = tileRanges[0],
			couldBeAnyTiles = tileRanges[1],
			shouldBeDoneTiles = tileRanges[2],
			actuallyRendereredTiles = tileRanges[3],
			regeneratableTiles = couldBeAnyTiles.filter(function (tile) {
				return tile instanceof Tile;
			});

		this.world.generateTilesOnPositions(couldBeAnyTiles.filter(function (tile) {
			return !(tile instanceof Tile);
		}));

		this.world.relaxTiles(regeneratableTiles, 0.1, true);

		actuallyRendereredTiles.forEach(function (tile) {
			tile.updateColorsForRegistry(registry);
		});

		outOfRangeTiles.forEach(function (tile) {
			if(!(tile instanceof Tile))
				return;
			registry.delete(tile.x + ',' + tile.y);
			console.log('deleted');
		}.bind(this));

		return actuallyRendereredTiles;
	};

	return Application;
});