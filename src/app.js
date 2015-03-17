require([
	'core'
], function (
	core
	) {
	function Application(element) {
		core.Application.call(this, element);
	}

	Application.prototype = Object.create(core.Application.prototype);
	Application.prototype.constructor = Application;

	var app = new Application();
	app.generateTilesOnUnsaturatedEdges(100);

	app.world.renderer.render();

	window.app = app;
});