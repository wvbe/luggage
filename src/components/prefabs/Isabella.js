import React from 'react';
import Container from '../Container';
import Cube from '../Cube';

const upperfacingSize = [1, 1, 0.5],
	upperfacingColor = 'purple',
	westernfacingSize = [0.5, 1, 1],
	westernfacingColor = 'orange',
	southernfacingSize = [1, 0.5, 1],
	southernfacingColor = 'green';

export default function ({ perspective }) {
	return <div>
		<Container position={ [8, 0, -7] } perspective={ perspective }>
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [3, 0, 0] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [3, 0, 1] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [3, 0, 2] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [3, 0, 3] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [3, 0, 4] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [2, 0, 5] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [1, 0, 5] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [2, 0, 3] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [1, 0, 3] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 0] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 1] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 2] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 3] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 4] } color={ southernfacingColor } />
		</Container>
		<Container position={ [4, 0, -7] } perspective={ perspective }>
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [2, 0, 0] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [1, 0, 0] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 0] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 1] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 2] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 3] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 4] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 5] } color={ southernfacingColor } />
		</Container>
		<Container position={ [0, 0, -7] } perspective={ perspective }>
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [2, 0, 0] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [1, 0, 0] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 0] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 1] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 2] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 3] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 4] } color={ southernfacingColor } />
			<Cube perspective={ perspective } size={ southernfacingSize } position={ [0, 0, 5] } color={ southernfacingColor } />
		</Container>
		<Container position={ [12, 0, 0] } perspective={ perspective }>
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, 0, 0] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, 0, 1] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, 0, 2] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, 0, 3] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, 0, 4] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, 0, 5] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -1, 5] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -2, 5] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -1, 3] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -2, 3] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -1, 0] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -2, 0] } color={ westernfacingColor } />
		</Container>
		<Container position={ [12, 5, 0] } perspective={ perspective }>
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, 0, 0] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, 0, 1] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, 0, 2] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, 0, 3] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, 0, 4] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, 0, 5] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -1, 5] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -2, 5] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -1, 3] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -2, 3] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -1, 0] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -2, 0] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -3, 1] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -3, 2] } color={ westernfacingColor } />
			<Cube perspective={ perspective } size={ westernfacingSize } position={ [0, -3, 4] } color={ westernfacingColor } />
		</Container>
		<Container position={ [7, 0, 0] } perspective={ perspective }>
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [3, 4, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [3, 3, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [3, 2, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [3, 1, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [3, 0, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [2, 5, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [2, 3, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [1, 5, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [1, 3, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [0, 4, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [0, 3, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [0, 2, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [0, 1, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [0, 0, 0] } color={ upperfacingColor } />
		</Container>
		<Container position={ [2, 0, 0] } perspective={ perspective }>
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [3, 5, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [2, 5, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [1, 5, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [0, 4, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [2, 3, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [1, 3, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [3, 2, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [3, 1, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [2, 0, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [1, 0, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [0, 0, 0] } color={ upperfacingColor } />
		</Container>
		<Container position={ [0, 0, 0] } perspective={ perspective }>
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [0, 5, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [0, 4, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [0, 3, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [0, 2, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [0, 1, 0] } color={ upperfacingColor } />
			<Cube perspective={ perspective } size={ upperfacingSize } position={ [0, 0, 0] } color={ upperfacingColor } />
		</Container>
	</div>;
}
