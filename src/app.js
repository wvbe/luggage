require([
	'core'
], function (
	core
	) {
	function Application() {
		core.Application.call(this);
	}

	Application.prototype = Object.create(core.Application.prototype);
	Application.prototype.constructor = Application;

	var app = new Application();
	//app.generateTilesOnUnsaturatedEdges(50);

	app.renderer.render();

	window.app = app;
});