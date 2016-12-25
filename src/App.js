import React, { Component } from 'react';

import * as styles from './styles';

import { translate } from './localization';

import Viewport from './components/Viewport';

const rootStyle = styles.merge(
	styles.block,
	styles.positioningAnchor,
	{
		width: '100vw',
		height: '100vh'
	});

export default class App extends Component {
	constructor () {
		super();
	}

	render () {
		return <luggage-root { ...rootStyle }>
			<Viewport />
		</luggage-root>;
	}
}
