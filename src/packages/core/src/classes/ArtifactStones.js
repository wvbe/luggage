define([
	'./Artifact'
], function(Artifact) {

	/**
	 * The character our gamer has control over. While the animations may be missing, the player can move through the
	 * world already.
	 * @constructor
	 */
	function ArtifactStones(tile, amount) {
		Artifact.call(this);

		this.name = 'ARTIFACT_STONES';

		this.grass = [];

		for(var i = 0, max = amount * 3 * Math.random(); i < max; i++) {
			var radius = 0.01 + 0.05 * Math.random();
			this.grass.push([
				radius + (1 - radius) * Math.random(),
				radius + (1 - radius) * Math.random(),
				radius
			]);
		}
	}

	ArtifactStones.prototype = Object.create(Artifact.prototype);
	ArtifactStones.prototype.constructor = ArtifactStones;

	ArtifactStones.prototype.render = function (renderer, tile) {
		this.grass.forEach(function (grass) {
			renderer.fillPerfectCircle(
					tile.x + grass[0],
					tile.y + grass[1],
					tile.z,
					grass[2],
					tile.strokeColor,
					null
			);
		});
	};

	return ArtifactStones;
});