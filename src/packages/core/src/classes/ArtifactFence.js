define([
	'./Artifact'
], function(Artifact) {

	/**
	 * The character our gamer has control over. While the animations may be missing, the player can move through the
	 * world already.
	 * @constructor
	 */
	function ArtifactFence() {
		Artifact.call(this);

		this.name = 'ARTIFACT_FENCE';
	}

	ArtifactFence.prototype = Object.create(Artifact.prototype);
	ArtifactFence.prototype.constructor = ArtifactFence;

	ArtifactFence.prototype.isWalkable = function () {
		return false;
	};

	ArtifactFence.prototype.render = function (renderer, tile) {
		renderer.fillFlatPlane(
				tile.x ,
				tile.y,
				tile.z + 0.7,
			1,
			1,
			tile.strokeColor,
			null
		);
	};

	return ArtifactFence;
});