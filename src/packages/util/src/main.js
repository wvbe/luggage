define([
	'./BinaryHeap'
], function (BinaryHeap) {


	function pythagoras (x, y) {
		return Math.sqrt(x*x + y*y);
	}

	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex ;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	function randomFromArray (array) {
		return array[Math.floor(Math.random() * array.length)];
	}

	function randomDeviation (max) {
		if (max === undefined)
			max = 1;
		return max * (1 - Math.random() * 2);
	}

	// http://davidwalsh.name/javascript-debounce-function
	function debounce(func, wait, immediate) {
		var timeout;
		return function () {
			var context = this, args = arguments;
			var later = function () {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}

	return {
		BinaryHeap: BinaryHeap,


		debounce: debounce,
		pythagoras: pythagoras,
		shuffle: shuffle,
		randomFromArray: randomFromArray,
		randomDeviation: randomDeviation
	};
});