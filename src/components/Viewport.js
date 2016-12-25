import React from 'react';

import * as styles from '../styles';

const viewportStyle = styles.merge(
	styles.absoluteCentered
);

const Viewport = () => {
	return (
		<luggage-viewport { ...viewportStyle }>
		</luggage-viewport>
	);
};

export default Viewport;
