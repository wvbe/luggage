define([
	'tiny-emitter',

	'ui',	
	'util',
	'language',
	'config',
	'Color',

	'./InputService',

	'./classes/World',
	'./classes/Tile',
	'./classes/Renderer',
	'./classes/CanvasRenderer',
	'./classes/PlayerEntity',
	'./classes/MenuItem',
	'./classes/Minimap',
	'./classes/Perspective'
], function (
	EventEmitter,

	ui,
	util,
	language,
	config,
	Color,

	InputService,

	World,
	Tile,
	Renderer,
	CanvasRenderer,
	PlayerEntity,
	MenuItem,
	Minimap,
	Perspective
) {


	function Game() {
		EventEmitter.call(this);
		// If you wanna know which buttons are being pushed, talk to this guy right here
		this.input = new InputService();

		// Service that handles the player character's mental or verbal expressions
		this.expressions = new ui.TooltipSlot('expressions', {}, document.getElementById('expressions'));

		// The coordinate set and helper functions
		this.perspective = new Perspective();

		// Contains the material that makes up a comprehensive world
		this.world = new World(this);

		this.viewport = new Renderer(this.perspective, document.getElementById('viewport'));

		// The canvas to render the world to, if you so please
		this.renderer = new CanvasRenderer(this.perspective, document.getElementById('world'))
			.onRender(this.world.renderTiles.bind(this.world));

		this.mouse = false;
		this.mouseRenderer = new CanvasRenderer(this.perspective, document.getElementById('mouse'))
			.onRender(function (renderer) {
				if(!this.mouse)
					return;

				var hoveredTile = this.world.tileForCoordinates(this.mouse),
					x = this.mouse[0],
					y = this.mouse[1],
					fillColor = new Color('yellow').setAlpha(0.1),
					strokeColor = new Color('yellow'),
					secondaryStrokeColor = strokeColor.setAlpha(0.5);

				if(!hoveredTile)
					return;
				var haloSize = 0.1;
				renderer
					.strokeSpatialLines([
						[hoveredTile.x, y, hoveredTile.z < 0 ? 0 : hoveredTile.z],
						[hoveredTile.x + 1, y, hoveredTile.z < 0 ? 0 : hoveredTile.z]
					], secondaryStrokeColor)
					.strokeSpatialLines([
						[x, hoveredTile.y, hoveredTile.z < 0 ? 0 : hoveredTile.z],
						[x, hoveredTile.y + 1, hoveredTile.z < 0 ? 0 : hoveredTile.z]
					], secondaryStrokeColor);


				if(hoveredTile.z <= 0)
					renderer.fillFlatPlane(hoveredTile.x, hoveredTile.y, 0, 1, 1, strokeColor, fillColor);
				else
					//renderer.fillTileHalo(hoveredTile, strokeColor, fillColor);
					renderer.fillBox(hoveredTile.x, hoveredTile.y, 0, 1, 1, hoveredTile.z, strokeColor, fillColor);

			}.bind(this));

		this.worldTooltipRenderer = new CanvasRenderer(this.perspective, document.getElementById('expressions'))
			.onRender(function (renderer) {
				var tooltip = this.expressions.getCurrent();

				if(!tooltip)
					return;

				var cartOffset = renderer.perspective.pixelForCoordinates(
						tooltip.coordinates[0],
						tooltip.coordinates[1],
						tooltip.coordinates[2],
						false
					),

					// Grab the existing element for this tooltip or make one
					tooltipElement = tooltip.getOrCreateElement();

				// If element isn't already in the canvas, put it there
				if(!tooltipElement.parentElement !== renderer.canvas) {
					renderer.canvas.appendChild(tooltipElement);
				}

				// This renderer is not pannable, instead offset tooltips
				tooltipElement.style.bottom = (this.perspective.size.y - cartOffset[1]) + 'px';
				tooltipElement.style.left= cartOffset[0] + 'px';
			}.bind(this));


		// The player
		this.player = new PlayerEntity(this.world.getSpawnTile(), {
			moveInterval: config.player.speed
		});
		this.playerRenderer = new CanvasRenderer(this.perspective, document.getElementById('player'))
			.onRender(function (renderer) {
				var hoveredTile = this.player.tile;
				if(hoveredTile) {
					if(hoveredTile.z <= 0)
						renderer.fillFlatPlane(hoveredTile.x-0.1, hoveredTile.y-0.1, 0,1.2,1.2,new Color('blue'),new Color('blue').setAlpha(0.3));
					else
						renderer.fillTileHalo(hoveredTile,new Color('blue'),new Color('blue').setAlpha(0.3), 0.1);
				}
			}.bind(this));

		this._init();

		document.addEventListener('contextmenu', function (event) {
			if(event.ctrlKey)
				return;

			event.preventDefault();
		});


		/*
		 * Mouse events
         */
		var mouseEventWhich = {
			0: 'none',
			1: 'lmb',
			2: 'mmb',
			3: 'rmb'
		};
		document.getElementById('viewport').addEventListener('mousedown', event => {
			if(event.ctrlKey)
				return;

			if(mouseEventWhich[event.which] === undefined)
				return;

			this.emit(
				'click:' + mouseEventWhich[event.which],
				this.perspective.coordinatesForPixel(event.layerX, event.layerY, false)
			);

			event.preventDefault();
		});
	}

	Game.prototype = Object.create(EventEmitter.prototype);
	Game.prototype.constructor = Game;

	function roundToDecimals (numb, dec) {
		if(dec === undefined)
			dec = 2;

		var pow = Math.pow(10, dec);

		return Math.round(numb * pow) / pow;
	}

	/**
	 * Binds different parts of the game (and browser) together so that it actually does shit
	 * @private
	 */
	Game.prototype._init = function () {
		// PlayerEntity thoughts make tooltips
		this.player.on('thought', this.playerTooltip.bind(this));

		console.time('Generating');
		this.world.generateInitialTiles(this.player.tile);
		console.timeEnd('Generating');

		// When player moves...
		this.player.on('move', tile => {
			this.playerRenderer.clear();
			this.playerRenderer.render();

			this.focusOnTile(this.getPlayerEntityLocation());

			this.expressions.close();
		});

		this.player.on('error', err => {
			console.error(err.message);
			this.playerTooltip(err.message);
		});

		this.on('click:rmb', coordinates => {
			var tile = this.world.tileForCoordinates(coordinates);
			this.player.walk(this.player.findPathToTile(this.world, tile));
		});

		this.on('click:lmb', coordinates => {
			var tile = this.world.tileForCoordinates(coordinates);

			if (!tile)
				return;

			this.expressions.open(new ui.MenuTooltip(tile.getSurfaceCoordinates(), [
				new MenuItem('Go here', () => {
					this.player.walk(this.player.findPathToTile(this.world, tile));
				}),
				new MenuItem(`'Ave a better look`, () => {
					const tileStats = {
						Climate: tile.getClimate(),
						Coordinates: `${roundToDecimals(coordinates[1])}"N ${roundToDecimals(coordinates[0])}"W`,
						Altitude: `${roundToDecimals(tile.z * 20)}m`
					};
					this.expressions.open(new ui.HtmlTooltip(
						tile.getSurfaceCoordinates(),
						Object.keys(tileStats).map(statName => `<dl class="tooltip__item"><dt>${statName}</dt><dd>${tileStats[statName]}</dd></dl>`).join('')
					));
					this.worldTooltipRenderer.render();
					console.log('INSPECT', tile);
				})
			].concat(tile.getMenuItems()), config.tooltip));
			this.worldTooltipRenderer.render();
		});

		// @TODO: Give Tile methods to flag it with stuff
		document.getElementById('viewport').addEventListener('mousemove', event => {
			this.mouse = this.perspective.coordinatesForPixel(event.layerX, event.layerY, false);
			this.mouseRenderer.clear();
			this.mouseRenderer.render();
		});

		console.time('Rendering');
		var boundingBox = this.perspective.getBoundingBoxForTiles(this.world.list()).map(Math.ceil);
		boundingBox[1] = boundingBox[1] + 200;
		this.perspective.updateSizeForElement(boundingBox);
		this.viewport.canvas.style.marginLeft = -(boundingBox[0] / 2) + 'px';
		this.viewport.canvas.style.marginTop = -(boundingBox[1] / 2) + 'px';
		this.focusOnTile(this.getPlayerEntityLocation());
		console.timeEnd('Rendering');

		var tileCount = this.world.list().length;
		var stats = {
			tiles: tileCount,
			worldPixelSize: boundingBox,
			averageZ: this.world.list().reduce(function (avg, tile) {
				return avg + tile.z
			}, 0) / tileCount,
			climates: this.world.list().reduce(function (totals, tile) {
				var climate = tile.getClimate();
				totals[climate] = (totals[climate] || 0) + 1;
				return totals;
			}, {})
		};
		Object.keys(stats).forEach(s => console.log('\t' + s + ':\t', stats[s]));
	}

	/**
	 * Makes sure the camera shifts towards dead-center on the player.
	 * @param {Tile} tile
	 */
	Game.prototype.focusOnTile = function (tile) {
		if(!tile) {
			this.player.think('Weird, this tile doesnt exist', true);
			return;
		}

		this.viewport.panViewportToTile(
			tile.x,
			tile.y,
			tile.z,
			0,//this.perspective.size.x/2,
			0//this.perspective.size.y/2
		);
	};

	/**
	 * @returns {Tile}
	 */
	Game.prototype.getPlayerEntityLocation = function () {
		return this.player.tile;
	};

	Game.prototype.playerTooltip = function (input) {
		if(input instanceof Error)
			input = input.message;

		this.expressions.open(new ui.RandomLanguageTooltip(
			this.player.tile.getSurfaceCoordinates(),
			input,
			config.player.language
		));
		this.worldTooltipRenderer.render();
	};


	Game.prototype.iterateEntities = function (center) {
		var entities = this.world.entities;

		entities.forEach(function (entity) {
			if(!this.world.contains(entity.tile))
				this.world.removeEntity(entity);
		}.bind(this));

	};

	return Game;
});