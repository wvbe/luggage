import React, { Component } from 'react';

import * as styles from './styles';

import Perspective from './classes/Perspective';

import Viewport from './components/Viewport';
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
		const upperfacingSize = [1, 1, 0.5],
			upperfacingColor = 'purple',
			westernfacingSize = [0.5, 1, 1],
			westernfacingColor = 'orange',
			southernfacingSize = [1, 0.5, 1],
			southernfacingColor = 'green';
		return <luggage-root { ...rootStyle }>
			<Viewport>
				<Container coordinates={ [8, 0, -7] } perspective={ this.perspective }>
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [3, 0, 0] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [3, 0, 1] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [3, 0, 2] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [3, 0, 3] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [3, 0, 4] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [2, 0, 5] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [1, 0, 5] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [2, 0, 3] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [1, 0, 3] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 0] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 1] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 2] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 3] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 4] } color={ southernfacingColor } />
				</Container>
				<Container coordinates={ [4, 0, -7] } perspective={ this.perspective }>
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [2, 0, 0] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [1, 0, 0] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 0] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 1] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 2] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 3] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 4] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 5] } color={ southernfacingColor } />
				</Container>
				<Container coordinates={ [0, 0, -7] } perspective={ this.perspective }>
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [2, 0, 0] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [1, 0, 0] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 0] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 1] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 2] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 3] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 4] } color={ southernfacingColor } />
					<Cube perspective={ this.perspective } size={ southernfacingSize } position={ [0, 0, 5] } color={ southernfacingColor } />
				</Container>
				<Container coordinates={ [12, 0, 0] } perspective={ this.perspective }>
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, 0, 0] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, 0, 1] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, 0, 2] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, 0, 3] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, 0, 4] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, 0, 5] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -1, 5] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -2, 5] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -1, 3] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -2, 3] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -1, 0] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -2, 0] } color={ westernfacingColor } />
				</Container>
				<Container coordinates={ [12, 5, 0] } perspective={ this.perspective }>
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, 0, 0] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, 0, 1] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, 0, 2] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, 0, 3] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, 0, 4] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, 0, 5] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -1, 5] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -2, 5] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -1, 3] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -2, 3] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -1, 0] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -2, 0] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -3, 1] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -3, 2] } color={ westernfacingColor } />
					<Cube perspective={ this.perspective } size={ westernfacingSize } position={ [0, -3, 4] } color={ westernfacingColor } />
				</Container>
				<Container coordinates={ [7, 0, 0] } perspective={ this.perspective }>
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [3, 4, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [3, 3, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [3, 2, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [3, 1, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [3, 0, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [2, 5, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [2, 3, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [1, 5, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [1, 3, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [0, 4, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [0, 3, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [0, 2, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [0, 1, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [0, 0, 0] } color={ upperfacingColor } />
				</Container>
				<Container coordinates={ [2, 0, 0] } perspective={ this.perspective }>
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [3, 5, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [2, 5, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [1, 5, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [0, 4, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [2, 3, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [1, 3, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [3, 2, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [3, 1, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [2, 0, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [1, 0, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [0, 0, 0] } color={ upperfacingColor } />
				</Container>
				<Container coordinates={ [0, 0, 0] } perspective={ this.perspective }>
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [0, 5, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [0, 4, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [0, 3, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [0, 2, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [0, 1, 0] } color={ upperfacingColor } />
					<Cube perspective={ this.perspective } size={ upperfacingSize } position={ [0, 0, 0] } color={ upperfacingColor } />
				</Container>
			</Viewport>
		</luggage-root>;
	}
}
