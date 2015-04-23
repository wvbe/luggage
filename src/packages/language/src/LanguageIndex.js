define([
	'util'
], function (
	util
) {
	function LanguageIndex (content) {
		if(!content) {}

		else if(typeof content === 'string')
			content = [content];

		else if(Array.isArray(content))
			this._array = content;

		else if(typeof content === 'object')
			Object.keys(content).forEach(function (contentName) {
				this[contentName] = new LanguageIndex(content[contentName]);
			}.bind(this));
	}

	LanguageIndex.prototype.get = function (namespace) {
		if(namespace && this[namespace])
			return this[namespace].get();

		if(!this._array)
			throw new Error('NO_LANGUAGE_DATA');

		return util.randomFromArray(this._array);
	};

	return LanguageIndex;
});