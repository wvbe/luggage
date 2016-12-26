import colorJs from 'color-js';

export { style } from 'glamor';
export { merge } from 'glamor';

export const block = {
	display: 'block'
};

export function absolute (x, y) {
	return {
		position: 'absolute',
		left: x,
		top: y
	};
}

export const absoluteCentered = {
	position: 'absolute',
	left: '50%',
	top: '50%',
	transform: 'translate(-50%, -50%)'
};
export const positioningAnchor = {
	position: 'relative'
};

export const verticalFlexbox = {
	display: 'flex',
	flexDirection: 'vertical'
};

export function color (input) {
	return colorJs(input);
}
