import React from 'react';

import * as styles from '../styles';

const viewportStyle = styles.merge(
	styles.absoluteCentered
);

const Viewport = ({ children }) => {
	return (
		<luggage-viewport { ...viewportStyle }>{ children }</luggage-viewport>
	);
};

export default Viewport;
