import * as selectors from 'fontoxml-selectors';

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
//
// Source: https://davidwalsh.name/javascript-debounce-function
export function debounce (func, wait, immediate) {
	let timeout;
	return () => {
		const args = arguments,
			callNow = immediate && !timeout;

		clearTimeout(timeout);
		timeout = setTimeout(() => {
			timeout = null;
			if (!immediate) {
				func.apply(this, args);
			}
		}, wait);

		if (callNow) {
			func.apply(this, args);
		}
	};
}

export function guid () {
	function s4 () {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}

	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}

// source: fontoxml-utils/getQueryParameterByName
export function getQueryParameterByName (queryString, name) {
	var regex = new RegExp("[\\?&]" + name + "=([^&]*)"),
		results = regex.exec(queryString);

	if (!results || !results.length) {
		return;
	}

	var valueForName = results[1].replace(/\+/g, " ");

	return decodeURIComponent(valueForName);
}

export function filterUnique (thing, index, things) {
	return things.indexOf(thing) === index;
}

export function evaluateXPathToNodes (query, node) {
	return selectors.evaluateXPathToNodes(query, node, selectors.domFacade);
}

export function evaluateXPathToString (query, node) {
	return selectors.evaluateXPathToString(query, node, selectors.domFacade);
}

export function evaluateXPathToStrings (query, node) {
	return selectors.evaluateXPathToStrings(query, node, selectors.domFacade);
}
