import React from 'react';

import { translate } from './localization';

describe('localization translate', () => {
	it('can interpolate a language string', () => {
		expect(translate('testMessage', { testMessage: 'derp' })).toEqual('This is a derp');
	});
});
