define([
	'text!./player.json'
], function (playerJSON) {
	return {
		player: JSON.parse(playerJSON)
	}
});