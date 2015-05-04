define([
	'./Artifact'
], function(Artifact) {

	/**
	 * The character our gamer has control over. While the animations may be missing, the player can move through the
	 * world already.
	 * @constructor
	 */
	function ArtifactVegetation() {
		Artifact.call(this);

		this.name = 'ARTIFACT_VEGETATION';

		this.grass = [];

		for(var i = 0, max = 3 + 10 * Math.random(); i < max; i++) {
			this.grass.push([
				Math.random(),
				Math.random(),
				0.4 + 0.5 * Math.random()
			]);
		}
	}

	ArtifactVegetation.prototype = Object.create(Artifact.prototype);
	ArtifactVegetation.prototype.constructor = ArtifactVegetation;

	ArtifactVegetation.prototype.render = function (renderer, tile) {
		this.grass.forEach(function (grass) {
			renderer.strokeSpatialLines([
				[
					tile.x + grass[0],
					tile.y + grass[1],
					tile.z
				],
				[
					tile.x + grass[0],
					tile.y + grass[1],
					tile.z + grass[2]
				]
			], tile.strokeColor);
		});
	};

	return ArtifactVegetation;
});