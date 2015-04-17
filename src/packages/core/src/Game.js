define([
	'ui',
	'Color',

	'./InputService',

	'./classes/World',
	'./classes/Tile',
	'./classes/Renderer',
	'./classes/Player'
], function (
	ui,
	Color,

	InputService,

	World,
	Tile,
	Renderer,
	Player
) {
	var
		// Speed of the parallax backdrop, relative to player movement
		PARALLAX_MODIFIER = -0.1,

		// Zoom to this fraction (or the inverse) when zooming in (or out)
		SCROLL_ZOOM_SPEED = 0.8,

		// The radius of tiles that is kept in memory (and therefore, renderable)
		FOG_OF_WAR_DISTANCE = 16,

		// Amount of time to iterateTerrain() when game starts. Correlates with Tile.maxRegen
		INITIAL_TERRAIN_ITERATIONS = 11,

		PLAYER_MOVE_INTERVAL = 250,

		// Configuration for the key listener for player movement, arrows (InputService)
		ARROW_KEY_CONFIG = {
			intervalTime: PLAYER_MOVE_INTERVAL
		},

		// Options for short player thought tooltips
		PLAYER_LANGUAGE_TOOLTIP_OPTIONS = {
			timeout: 500
		};

	/**
	 *
	 * @constructor
	 */
	function Game() {
		// If you wanna know which buttons are being pushed, talk to this guy right here
		this.input = new InputService();

		// Contains the material that makes up a comprehensive world
		this.world = new World(this);

		// The canvas to render the world to, if you so please
		this.renderer = new Renderer(document.getElementById('world'))
			.onRender(this.world.renderTiles.bind(this.world));

		// The player
		this.player = new Player(this.world.getSpawnTile(), {
			moveInterval: PLAYER_MOVE_INTERVAL
		});
		
		// The canvas to render the player to
		this.cursor = new Renderer(document.getElementById('player'))
			.onRender(this.player.renderEntity.bind(this.player));
		
		// Service that handles the player character's mental or verbal expressions
		this.expressions = new ui.TooltipSlot('expressions', {}, document.getElementById('expressions'));

		// Parallax scrolling to 
		this.backdrop = document.getElementById('backdrop');

		this._init();
	}


	/**
	 * Binds different parts of the game (and browser) together so that it actually does shit
	 * @private
	 */
	Game.prototype._init = function () {
		// Player thoughts make tooltips
		this.player.on('thought', function (message) {
			this.expressions.open(new ui.RandomLanguageTooltip(message, PLAYER_LANGUAGE_TOOLTIP_OPTIONS));
		}.bind(this));

		// Generate the initial contents of the world, and iterate it 11 times
		this.world.generateTilesOnPositions(this.world.getPotentialTilesAroundPosition(this.player.tile, FOG_OF_WAR_DISTANCE));
		for(var i = 0, center = this.player.tile; i < INITIAL_TERRAIN_ITERATIONS; ++i)
			this.iterateTerrain(center);

		// When player moves...
		this.player.on('move', function (tile) {
			// Manage the surrounding terrain, progressing each tile between 9% and 14% towards completion
			this.iterateTerrain(tile);

			// Look at the new player location
			this.focusOnTile(tile);

			// Update the parallax
			var bgPos = this.renderer.pixelForCoordinates(
				tile.x * PARALLAX_MODIFIER,
				tile.y * PARALLAX_MODIFIER,
				tile.z * PARALLAX_MODIFIER,
				true
			);
			this.backdrop.setAttribute('style', 'background-position: ' + bgPos[0] +'px ' + bgPos[1] + 'px;');
		}.bind(this));

		// Start listening for keyboard input
		this.setInputListeners();

		// Reset viewport
		this.focusOnTile(this.getPlayerLocation());

		// Set up mouse tracking (hover and clicks)

		var lastHoveredTile = undefined;

		// @TODO: Give Tile methods to flag it with stuff
		document.getElementById('viewport').addEventListener('mousemove', function (event) {
			var hoveredTile = this.world.tileForCoordinates(
				this.renderer.coordinatesForPixel(event.layerX, event.layerY, false)
			);

			if(hoveredTile === lastHoveredTile)
				return;

			if(hoveredTile)
				hoveredTile.hovered = true;

			if(lastHoveredTile)
				lastHoveredTile.hovered = false;

			lastHoveredTile = hoveredTile;

			this.renderer.clear();
			this.renderer.render();
		}.bind(this));

		document.getElementById('viewport').addEventListener('mousedown', function (event) {
			var destination = this.world.tileForCoordinates(
				this.renderer.coordinatesForPixel(event.layerX, event.layerY, false)
			);

			this.player.walk(this.player.findPathToTile(this.world, destination));
		}.bind(this));

	};
	/**
	 * Enlarge (or opposite) the world as you see it
	 * @param {Number} amount The fraction by which to divide or multiply, between 0 and 1
	 * @param {Tile} tile Zoom centers on this tile, defaults to player location
	 */
	Game.prototype.zoom = function (amount, tile) {
		if(amount === undefined)
			amount = true;

		if(amount === !!amount)
			amount = this.renderer.getTileSize() * (!amount ? SCROLL_ZOOM_SPEED : 1/SCROLL_ZOOM_SPEED)

		if(!amount)
			amount = 1;

		this.renderer.setTileSize(Math.abs(amount));

		this.focusOnTile(tile || this.getPlayerLocation());
	};

	/**
	 * Makes sure the camera shifts towards dead-center on the player.
	 * @param {Tile} tile
	 */
	Game.prototype.focusOnTile = function (tile) {
		if(!tile) {
			this.player.think('Weird, this tile doesnt exist', true);
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

	/**
	 * @returns {Tile}
	 */
	Game.prototype.getPlayerLocation = function () {
		return this.player.tile;
	};

	/**
	 * Configure the input service to control different parts of the game
	 */
	Game.prototype.setInputListeners = function () {
		// Bind arrow keys to player movement
		this.input
			.configureKey(37, ARROW_KEY_CONFIG, function () { // left
				this.player.move(this.player.getTileRelativeToPosition(this.world, -1, 0));
			}.bind(this))
			.configureKey(38, ARROW_KEY_CONFIG, function () { // up
				this.player.move(this.player.getTileRelativeToPosition(this.world, 0, 1));
			}.bind(this))
			.configureKey(39, ARROW_KEY_CONFIG, function () { // right
				this.player.move(this.player.getTileRelativeToPosition(this.world, 1, 0));
			}.bind(this))
			.configureKey(40, ARROW_KEY_CONFIG, function () { // down
				this.player.move(this.player.getTileRelativeToPosition(this.world, 0, -1));
			}.bind(this))
			.listen();

	};

	/**
	 * Makes alterations to the terrain, centering on a given tile
	 * @param {Tile} center
	 */
	Game.prototype.iterateTerrain = function (center) {
		var registry = this.world,

			// An array of arrays of tiles that fit in between given radiuses
			tileRanges = this.world.getTilesWithinRanges(center, [
				FOG_OF_WAR_DISTANCE + 1,
				FOG_OF_WAR_DISTANCE
			], true, true),

			// Put a name to the ranges
			outOfRangeTiles = tileRanges[0],
			withinRangeTiles = tileRanges[1],

			// The tiles that were generated on unfilled coordinates
			newTiles = this.world.generateTilesOnPositions(
				withinRangeTiles.filter(function (tile) {
					return !(tile instanceof Tile);
				})
			),

			// The portion of tiles that should progress towards completion
			regeneratableTiles = withinRangeTiles.filter(function (tile) {
				return (tile instanceof Tile) && tile.canStillBeChanged();
			});

		// Remove obsolete tiles
		outOfRangeTiles.forEach(function (tile) {
			if(!(tile instanceof Tile))
				return;
			registry.delete([tile.x, tile.y]);
		}.bind(this));

		// Relax tiles that are new or unfinished.
		this.world.relaxTiles(regeneratableTiles.concat(newTiles), 0.03, true);
	};

	return Game;
});