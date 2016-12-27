import React from 'react';

import Point from '../classes/Point';
import Container from './Container';
import Cube from './Cube';
import * as styles from '../styles';

function getAdjacentForPoint (points, point) {
	const x = point[0],
		y = point[1];

	return [
		//[x - 1, y - 1],
		[x - 1, y],
		//[x - 1, y + 1],
		[x, y - 1],
		[x, y + 1],
		//[x + 1, y - 1],
		[x + 1, y],
		//[x + 1, y + 1]
	].map(position => {
		const row = points[position[1]];
		if (row)
			return row[position[0]];
	})
		.filter(point => !!point);
}

const Terrain = ({ perspective, size = [10, 10, 1] }) => {
	const coordinates = [];

	for (let y = 0; y < size[1]; ++y) {
		const row = [];
		for(let x = 0; x < size[0]; ++x) {
			row.push(new Point(x, y, size[2] * Math.random()));
		}
		coordinates.push(row);
	}

	let lines = {};
	coordinates.forEach(row => row.forEach(a => getAdjacentForPoint(coordinates, a).forEach(b => {
		const key = [a[0] + ',' + a[1], b[0] + ',' + b[1]].sort().join('x');

		if(lines[key])
			return;

		lines[key] = {
			start: a,
			end: b
		};
	})));

	coordinates.reduce((points, row) => points.concat(row), []).forEach(point => {
		const adjacent = getAdjacentForPoint(coordinates, point),
			averageZ = adjacent.reduce((total, adjac) => total + adjac[2], 0) / adjacent.length;

		point[2] = 0.05* point[2] + 0.95 * averageZ;
	});
	coordinates.reduce((points, row) => points.concat(row), []).forEach(point => {
		const adjacent = getAdjacentForPoint(coordinates, point),
			averageZ = adjacent.reduce((total, adjac) => total + adjac[2], 0) / adjacent.length;

		point[2] = 0.05* point[2] + 0.95 * averageZ;
	});
	coordinates.reduce((points, row) => points.concat(row), []).forEach(point => {
		const adjacent = getAdjacentForPoint(coordinates, point),
			averageZ = adjacent.reduce((total, adjac) => total + adjac[2], 0) / adjacent.length;

		point[2] = 0.05* point[2] + 0.95 * averageZ;
	});
	coordinates.reduce((points, row) => points.concat(row), []).forEach(point => {
		const adjacent = getAdjacentForPoint(coordinates, point),
			averageZ = adjacent.reduce((total, adjac) => total + adjac[2], 0) / adjacent.length;

		point[2] = 0.05* point[2] + 0.95 * averageZ;
	});
	coordinates.reduce((points, row) => points.concat(row), []).forEach(point => {
		const adjacent = getAdjacentForPoint(coordinates, point),
			averageZ = adjacent.reduce((total, adjac) => total + adjac[2], 0) / adjacent.length;

		point[2] = 0.05* point[2] + 0.95 * averageZ;
	});
	return (
		<Container perspective={ perspective }>
			{ Object.keys(lines).map((key, i) => {
				const line = lines[key],
					size = perspective.toPixels(line.end.subtract(line.start)),
					start = perspective.toPixels(line.start),
					offset = [
						Math.min(size[0], 0),
						Math.min(size[1], 0)
					];

				return <svg
					key={ i }
					viewBox={ [0, 0].concat(size.map(x => Math.abs(x))).join(' ') }
					width={ Math.abs(size[0]) }
					height={ Math.abs(size[1]) }
					style={ styles.absolute(start[0] + offset[0] + 5, start[1] + offset[1] + 5) }>
					<line
						x1={ 0 - offset[0] }
						y1={ 0 - offset[1] }
						x2={ size[0] - offset[0] }
						y2={ size[1] - offset[1] }
						data-offset={ offset }
						strokeWidth="0.4"
						stroke="black"/>
				</svg>;
			}) }
		</Container>
	);
};

export default Terrain;
