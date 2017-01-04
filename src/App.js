import React, { Component } from 'react';

import * as styles from './styles';

import Perspective from './classes/Perspective';

import Viewport from './components/Viewport';
import Terrain from './components/Terrain';
import Container from './components/Container';
import Isabella from './components/prefabs/Isabella';
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

		this.perspective = new Perspective(30, 12);
	}

	render () {
		return <luggage-root { ...rootStyle }>
			<Viewport>
				<Container
					perspective={ this.perspective }
					position={ [0, 0, -60] }>
					<Terrain
						perspective={ this.perspective }
						size={ [100, 100, 0.5] }
						smoothing={ 0 } />
				</Container>
				<Cube perspective={ this.perspective } position={ [1, 0, 0] } color='blue' />
				<Cube perspective={ this.perspective } position={ [0, 0, 0] } color='red' />
			</Viewport>
		</luggage-root>;
	}
}
