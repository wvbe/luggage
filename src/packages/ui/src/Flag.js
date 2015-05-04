define([], function() {

	function Flag() {
		this.statistics = [];
	}

	Flag.prototype.addStatistic = function (element, formatter) {
		this.statistics.push([element, formatter]);
		return this;
	};

	Flag.prototype.update = function (object) {
		this.statistics.forEach(function (statistic) {
			statistic[0].innerHTML = statistic[1](object);
		});
		return this;
	};

	return Flag;
});