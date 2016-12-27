import React from 'react';

import Point from '../classes/Point';
import Container from './Container';
import Cube from './Cube';
import * as styles from '../styles';

const Terrain = ({ perspective, size = [10, 10, 1], resolution = 1 }) => {
	const plots = size[0] * size[1] * resolution,
		coordinates = [];

	for (let i = 0; i < plots; ++i) {
		coordinates.push(new Point(
			Math.random() * size[0],
			Math.random() * size[1],
			Math.random() * size[2]));
	}

	let lines = [];
	coordinates.forEach(a => {
		lines = lines.concat(coordinates
			.filter(b => b !== a)
			.map(b => ({ start: a, end: b, dist: a.distanceTo(b) }))
			.sort((a, b) => a.dist < b.dist)
			.slice(0, 1));
	});


	return (
		<Container perspective={ perspective }>
			{ lines.map((ends, i) => {
				const a = ends.start,
					aPixels = perspective.toPixels(a),
					b = ends.end,
					dist = perspective.toPixels(a.subtract(b)).map(x => Math.abs(x));

				return <svg
					key={ i }
					viewBox={ [0, 0, dist[0], dist[1]].join(' ') }
					width={ dist[0] }
					height={ dist[1] }
					style={ styles.absolute(aPixels[0], aPixels[1]) }>
					<line
						x1={ 0 }
						y1={ 0 }
						x2={ dist[0] }
						y2={ dist[1] }
						strokeWidth="0.3" stroke="black"/>
				</svg>;
			}) }
			{ coordinates.map((coord, i) => {
				const pixels = perspective.toPixels(coord);

				return <svg
					key={ i }
					viewBox="0 0 10 10"
					width="10"
					height="10"
					style={ styles.absolute(pixels[0], pixels[1]) }>
					<circle
						cx={ 5 }
						cy={ 5 }
						r={ 2 } />
				</svg>;
			}) }
		</Container>
	);
};

export default Terrain;
