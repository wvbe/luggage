define([
	'./Artifact',
	'./MenuItem'
], function(Artifact, MenuItem) {

	/**
	 * The character our gamer has control over. While the animations may be missing, the player can move through the
	 * world already.
	 * @constructor
	 */
	function ArtifactHouse(tile) {
		Artifact.call(this);

		this.name = 'ARTIFACT_HOUSE';

		this.size = [
			0.15 + Math.random() * 0.4,
			0.15 + Math.random() * 0.4,
			0.2 + Math.random() * 0.8
		];

		this.offset = [
			Math.random() * (1 - this.size [0]),
			Math.random() * (1 - this.size [1])
		];

		this.menuItems = [
			new MenuItem('Sloop de huis', function () {
				console.log('Sloping', tile);
			}.bind(this))
		]
	}

	ArtifactHouse.prototype = Object.create(Artifact.prototype);
	ArtifactHouse.prototype.constructor = ArtifactHouse;

	ArtifactHouse.prototype.getMenuItems = function () {
		return this.menuItems;
	};

	ArtifactHouse.prototype.render = function (renderer, tile) {
		renderer.fillBox(
				tile.x + this.offset[0],
				tile.y + this.offset[1],
			tile.z,
			this.size[0],
			this.size[1],
			this.size[2],
			tile.strokeColor,
			tile.fillColor.lightenByRatio(0.7)
		);
	};

	return ArtifactHouse;
});