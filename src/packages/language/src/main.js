define([
	'./LanguageIndex',

	'text!./player.json',
	'text!./names.json'
], function (
	LanguageIndex,

	player,
	names
) {
	return new LanguageIndex({
		player: JSON.parse(player),
		names: JSON.parse(names)
	});
});