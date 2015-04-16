define([
	'util'
], function(util) {

	var heuristics = {
		manhattan: function(pos0, pos1) {
			var d1 = Math.abs(pos1.x - pos0.x);
			var d2 = Math.abs(pos1.y - pos0.y);
			return d1 + d2;
		},
		diagonal: function(pos0, pos1) {
			var D = 1;
			var D2 = Math.sqrt(2);
			var d1 = Math.abs(pos1.x - pos0.x);
			var d2 = Math.abs(pos1.y - pos0.y);
			return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
		}
	};



	function Path (world, start, end, validator) {

		function resolvePathByParents(world, node){
			var curr = node,
				parent = tileData(curr).parent,
				path = [];
			while(parent) {
				path.push(curr);
				curr = world.get(parent);
				parent = tileData(curr).parent;
			}
			return path;
		}

		var heuristic = heuristics.manhattan,
			closest = false,
			closestTile = start,
			_tileData = {},
			_openTiles = new util.BinaryHeap(function(node) {
				return node.f;
			});

		function dataTile(data) {
			return world.get(data.id);
		}
		function tileData(tile) {
			if(!_tileData[tile.id])
				_tileData[tile.id] = {
					id: tile.id
				};
			return _tileData[tile.id];
		}

		tileData(start).h = heuristic(start, end);

		_openTiles.push(tileData(start));

		while(_openTiles.size() > 0) {
			var currentTileData = _openTiles.pop(),
				currentTile = dataTile(currentTileData);

			// End case -- result has been found, return the traced path.
			if(dataTile(currentTile) === end) {
				return resolvePathByParents(world, end);
			}

			// Normal case -- move currentNode from open to closed, process each of its neighbours.
			currentTileData.closed = true;

			// Find all neighbours for the current node.
			var neighbours = currentTile.getNeighbours(world);

			neighbours.forEach(function (neighbour) {
				var neighbourData = tileData(neighbour);

				if(neighbourData.closed || neighbour.isWater())
					// Not a valid node to process, skip to next neighbour.
					return;

				// The g score is the shortest distance from start to current node.
				// We need to check if the path we have arrived at this neighbour is the shortest one we have seen yet.
				var gScore = currentTileData.g + 1, // used to be getCost()
					beenVisited = neighbourData.visited;

				if (neighbourData.visited)
					return;

				neighbourData.visited = true;
				neighbourData.parent = currentTile.id;
				
				neighbourData.h = neighbourData.h || heuristic(neighbour, end);
				neighbourData.g = gScore;
				neighbourData.f = neighbourData.g + neighbourData.h;
				
				//graph.markDirty(neighbour);

				if (closest) {
					// If the neighbour is closer than the current closestNode or if it's equally close but has
					// a cheaper path than the current closest node then it becomes the closest node
					if (neighbourData.h < closestTile.h || (neighbourData.h === closestTile.h && neighbourData.g < closestTile.g)) {
						closestTile = neighbour;
					}
				}

				if (!beenVisited) {
					// Pushing to heap will put it in proper place based on the 'f' value.
					_openTiles.push(neighbour);
				} else {
					// Already seen the node, but since it has been rescored we need to reorder it in the heap
					_openTiles.rescoreElement(neighbour);
				}

			});
		}

		if (closest) {
			return resolvePathByParents(world, closestTile);
		}

		// No result was found - empty array signifies failure to find path.
		return [];
	}

	return Path;
});