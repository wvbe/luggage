define([
	'./LanguageIndex',

	'text!./player.json',
	'text!./names.json',
	'text!./objects.json'
], function (
	LanguageIndex,

	player,
	names,
	objects
) {
	return new LanguageIndex({
		player: JSON.parse(player),
		names: JSON.parse(names),
		objects: JSON.parse(objects),
	});
});