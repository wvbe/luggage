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
		},
		MENU_TOOLTIP_OPTIONS = {
			timeout: 500000
		};

	/**
	 *
	 * @constructor
	 */
	function Game() {
		// If you wanna know which buttons are being pushed, talk to this guy right here
		this.input = new InputService();

		// Service that handles the player character's mental or verbal expressions
		this.expressions = new ui.TooltipSlot('expressions', {}, document.getElementById('expressions'));

		// Contains the material that makes up a comprehensive world
		this.world = new World(this);

		// The canvas to render the world to, if you so please
		this.renderer = new Renderer(document.getElementById('world'))
			.onRender(this.world.renderTiles.bind(this.world));


		this.worldTooltipRenderer = new Renderer(document.getElementById('expressions'))
			.onRender(function (renderer) {
				console.log('Updating tooltip position');
				var tooltip = this.expressions.getCurrent();

				if(!tooltip)
					return;

				var cartOffset = renderer.pixelForCoordinates(
					tooltip.coordinates[0],
					tooltip.coordinates[1],
					tooltip.coordinates[2],
					false
				),
				tooltipElement = tooltip.getOrCreateElement();

				if(!tooltipElement.parentElement !== renderer.canvas) {
					renderer.canvas.appendChild(tooltipElement);
				}

				console.log('CART OFFSET FOR TOOLTIP', tooltip, cartOffset);

				tooltipElement.style.bottom = (renderer.canvas.height - cartOffset[1]) + 'px';
				tooltipElement.style.left= cartOffset[0] + 'px';
			}.bind(this));


		// The player
		this.player = new Player(this.world.getSpawnTile(), {
			moveInterval: PLAYER_MOVE_INTERVAL
		});
		
		// The canvas to render the player to
		this.cursor = new Renderer(document.getElementById('player'))
			.onRender(this.player.renderEntity.bind(this.player));


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
			this.expressions.open(new ui.RandomLanguageTooltip(
				this.player.tile.getSurfaceCoordinates(),
				message,
				PLAYER_LANGUAGE_TOOLTIP_OPTIONS
			));
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

		var viewportElement = document.getElementById('viewport');
		viewportElement.addEventListener('mousedown', function (event) {
			var offset = getClickOffsetInParent(event, viewportElement);

			var tile = this.world.tileForCoordinates(
				this.renderer.coordinatesForPixel(offset[0], offset[1], false)
			);
			switch(event.which) {
				case 1:
					this.player.walk(this.player.findPathToTile(this.world, tile));
					break;
				default: // middle mouse
					break;
			}

			return false;
		}.bind(this));

		document.addEventListener('contextmenu', function(event) {
			if(event.ctrlKey)
				return; // Default/do nothing on all mouseclicks as long as ctrl is pressed

			event.preventDefault();

			var offset = getClickOffsetInParent(event, viewportElement),
				tile = this.world.tileForCoordinates(
				this.renderer.coordinatesForPixel(offset[0], offset[1], false)
			);
			this.expressions.open(new ui.MenuTooltip(tile.getSurfaceCoordinates(), tile.getMenuItems(), MENU_TOOLTIP_OPTIONS));
			this.worldTooltipRenderer.render();
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
		this.worldTooltipRenderer
			//.panViewportToTile(tile.x, tile.y, 0)
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



	function getClickOffsetInParent(event, clickableElement) {
		var clickedElement = null,
			clickOffsetX = event.layerX,
			clickOffsetY = event.layerY;

		if (event.target !== clickableElement) {
			while (clickedElement !== clickableElement) {
				clickedElement = clickedElement ? clickedElement.parentElement : event.target;

				var position = clickedElement.getBoundingClientRect();

				clickOffsetX = clickOffsetX + position.left;
				clickOffsetY = clickOffsetY + position.top;
			}
		}

		return [clickOffsetX, clickOffsetY];
	}

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