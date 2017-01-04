import React, { Component } from 'react';

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

class Terrain extends Component {

	componentDidMount () {
		this.iterations = 0;
		setInterval(() => {
			++this.iterations;
			this.forceUpdate();
		}, 10);
	}
	render () {
		const perspective = this.props.perspective,
			size = this.props.size,
			smoothing = this.props.smoothing;

		let coordinates = [];

		for (let y = 0; y < size[1]; ++y) {
			const row = [];
			for(let x = 0; x < size[0]; ++x) {
				const pixels = new Point(x, y, size[2] * (Math.cos(x + this.iterations) + Math.sin(y + this.iterations)));

				row.push(pixels);
			}
			coordinates.push(row);
		}

		// Smoothing iterations
		for(let z = 0; z < smoothing; ++z) {
			coordinates.reduce((points, row) => points.concat(row), [])
				.forEach(point => {
					const adjacent = getAdjacentForPoint(coordinates, point),
						averageZ = adjacent.reduce((total, adjac) => total + adjac[2], 0) / adjacent.length;

					point[2] = 0.5 * point[2] + 0.5 * averageZ;
				});
		}

		const translate = [0, 0, 0];
		const boundingBox = {
			min: [0, 0],
			max: [0, 0]
		};


		coordinates = coordinates.map((row, y) => row.map((coordinate, x) => {
			coordinate.forEach((c, i) => {
				if (c > translate[i])
					translate[i] = c;
			});

			const pixels = perspective.toPixels(coordinate);
			pixels.forEach((p, i) => {
				if (p < boundingBox.min[i])
					boundingBox.min[i] = p;

				if (p > boundingBox.max[i])
					boundingBox.max[i] = p;
			});

			return pixels;
		}));


		const dimensions = [
			boundingBox.max[0] - boundingBox.min[0],
			boundingBox.max[1] - boundingBox.min[1]
		];

		const gridStyle = {
			fill: 'transparent',
			stroke: 'black',
			strokeWidth: 0.3
		};

		const lines = [];
		for(let y = 0; y < coordinates.length; ++y) {
			lines.push(<polyline
				key={ 'ew-' + y }
				style={ gridStyle}
				points={ coordinates[y].map((c, y) => c.map((cc, i) => cc - boundingBox.min[i]).join(',')).join(' ') } />);
		}
		for(let x = 0; x < coordinates[0].length; ++x) {
			lines.push(<polyline
				key={ 'ns-' + x }
				style={ gridStyle}
				points={ coordinates.map((c, y) => c[x].map((cc, i) => cc - boundingBox.min[i]).join(',')).join(' ') } />);
		}

		const translateInPixels = perspective.toPixels(translate);
		return <svg
				style={{ position: 'absolute', top: boundingBox.min[1], left: boundingBox.min[0] }}
				viewBox={ [0, 0].concat(dimensions).join(' ') }
				width={ dimensions[0] }
				height={ dimensions[1] }>
			{ lines }
		</svg>;


	}
}

export default Terrain;
