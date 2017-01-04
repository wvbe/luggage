import React from 'react';

import * as styles from '../styles';

function getBoundingBoxForCoordinates(set, padding = 1) {
	const min = [],
		max = [];

	set.forEach(coordinate => {
		coordinate.forEach((coord, i) => {
			if (min[i] === undefined || coord < min[i])
				min[i] = coord;

			if (max[i] === undefined || coord > max[i])
				max[i] = coord;
		});
	});

	return {
		size: min.map((m, i) => Math.abs(max[i] - m) + 2 * padding),
		offset: min.map(m => m - padding)
	};
}

const Cube = ({ perspective, color, position = [0, 0, 0], size = [1, 1, 1] }) => {

	// Randomize some input for wonky cubes
	// position = position.map(p => p - 0.15 + 0.3 * Math.random());
	// size = size.map(p => p - 0.15 + 0.3 * Math.random());

	const faceCoordinates = [
			[[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]], // Western pane
			[[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]], // Upper pane
			[[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], // Southern pane
		].map(face => face.map(coordinates => {
			const offsetCoordinates = coordinates.map((coordinate, i) => {
				let scaledCoordinate = coordinate * size[i],
					offsetCoordinate = scaledCoordinate + position[i];

				return offsetCoordinate;
			});

			return perspective.toPixels(offsetCoordinates);
		})),
		perimeterCoordinates = [
			faceCoordinates[0][0],
			faceCoordinates[0][1],
			faceCoordinates[1][1],
			faceCoordinates[1][2],
			faceCoordinates[2][2],
			faceCoordinates[2][1]
		],
		boundingBox = getBoundingBoxForCoordinates(perimeterCoordinates),
		faceColors = [
			styles.color(color).desaturateByRatio(0.3),
			styles.color(color).lightenByRatio(0.4),
			styles.color(color).darkenByRatio(0.3)
		],
		lines = faceCoordinates.map((coordinateSets, i) => {
			const points = coordinateSets.map(coordinates => coordinates.map((c, i) => c - boundingBox.offset[i])
				.join(',')
			)
			.join(' ');

			return <polygon
				key={ i } points={ points } style={{ fill: faceColors[i] }} />;
		});

	lines.push(<polygon
		key={ 'perimeter' }
		points={ perimeterCoordinates.map(coordinates => coordinates.map((c, i) => c - boundingBox.offset[i]).join(',')).join(' ') }
		style={{ stroke: styles.color('black'), strokeWidth: 0.5, fill: 'transparent' }} />);

	const style = styles.merge({
		position: 'absolute',
		top: boundingBox.offset[1],
		left: boundingBox.offset[0]
	});
	return (
		<cube { ...style }>
			<svg
				width={ boundingBox.size[0] }
				height={ boundingBox.size[1] }>
				{ lines }
			</svg>
		</cube>
	);
};

export default Cube;
