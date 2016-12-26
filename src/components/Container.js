import React from 'react';

import * as styles from '../styles';

const Container = ({ perspective, coordinates, children }) => {
	const pixelCoordinates = perspective.toPixels(coordinates),
		tileBaseStyle = styles.merge(
			styles.block,
			styles.absolute(pixelCoordinates[0], pixelCoordinates[1]));
	return (
		<container { ...tileBaseStyle }>{ children }</container>
	);
};

export default Container;
