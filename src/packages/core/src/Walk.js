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

	function WalkExperiment() {

		this.World = World;
		this.Tile = Tile;
		this.Renderer = Renderer;
		this.Player = Player;

		// @TODO: Remove direct reference to a canvas element here
		this.renderer = new Renderer(document.getElementById('world'), function () {
			this.renderer.renderAroundTile(this.world, this.player.tile, 7); // @TODO: Move knwledge of app.player out of here
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
		this.generateTilesOnUnsaturatedEdges(50);
		this.world.relaxTiles(this.world.tiles, 0.1);
		this.world.relaxTiles(this.world.tiles, 0.1);
		this.world.relaxTiles(this.world.tiles, 0.1);
		this.world.relaxTiles(this.world.tiles, 0.1);
		this.world.relaxTiles(this.world.tiles, 0.1);
		var worldTiles = this.world.tiles;
		worldTiles.list().forEach(function(t) {
			t.fillColor = t.getFillRgb();

			if(t.z <= 2 && t.getUnfilledNeighbours(worldTiles).length) {
				var beachColor = new Color({
					hue: 40,
					saturation: 45,
					lightness: 90
				});
				t.fillColor = t.fillColor.blend(beachColor, 0.1 + 0.3 * (1 - t.z/2));
			}
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
		this.player.on('move', function (tile) {
			this.renderer.panToTile(tile);
			this.renderer.clear();
			this.renderer.render();

			var bgPos = this.renderer.pixelForCoordinates(tile.x * PARALLAX_MODIFIER, tile.y * PARALLAX_MODIFIER, tile.z * PARALLAX_MODIFIER, true);
			viewportElement.setAttribute('style', 'background-position: ' + bgPos[0] +'px ' + bgPos[1] + 'px;');

			this.cursor.clear();
			this.cursor.render();
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
		this.renderer.panToTile(this.player.tile);
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

	return Application;
});