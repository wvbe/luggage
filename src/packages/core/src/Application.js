define([
	'ui',

	'./classes/World',
	'./classes/Tile',
	'./classes/Renderer',
	'./classes/Player'
], function (
	ui,

	World,
	Tile,
	Renderer,
	Player
) {
	function Application() {

		this.World = World;
		this.Tile = Tile;
		this.Renderer = Renderer;
		this.Player = Player;

		// @TODO: Remove direct reference to a canvas element here
		this.renderer = new Renderer(document.getElementById('world'), function () {
			this.renderer.renderAroundTile(this.world, this.player.tile, 20); // @TODO: Move knwledge of app.player out of here
		}.bind(this));

		/**
		 * Describes the playable environment: tiles, distances, areas
		 * @type {World}
		 */
		this.world = new World(
			this, // Pass the app
			document.getElementById('world') // Specify canvas element to render World in
		);

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

		this.player.on('move', function (tile) {
			this.renderer.panToTile(tile);
			this.renderer.clear();
			this.renderer.render();
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

	}

	Application.prototype.getPlayerLocation = function () {
		return this.player.tile;
	};

	Application.prototype.generateTilesOnUnsaturatedEdges = function (iterations) {
		iterations = iterations === undefined
			? 1
			: parseInt(iterations || 0);
		var tiles = this.world.tiles,
			before = tiles.list().length;
		console.time('Generating tiles');
		for(var i = 0; i < iterations; ++i) {
			this.world.generateNewTiles();
		}
		var after = tiles.list().length;

		console.timeEnd('Generating tiles');
	};

	return Application;
});