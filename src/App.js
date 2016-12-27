import React, { Component } from 'react';

import * as styles from './styles';

import Perspective from './classes/Perspective';

import Viewport from './components/Viewport';
import Terrain from './components/Terrain';
import Container from './components/Container';
import Cube from './components/Cube';

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

		this.perspective = new Perspective(30, 24);
	}

	render () {
		return <luggage-root { ...rootStyle }>
			<Viewport>
				<Terrain
					perspective={ this.perspective }
					size={ [50, 50, 9] } />
			</Viewport>
		</luggage-root>;
	}
}
